#!/usr/bin/env bash

# MMMF release helper.
# Flags: --major, --minor, --patch, --yes, --dry-run, --help.
# The script commits and pushes the version/tag; release.yml creates the
# GitHub Release, so the gh CLI is not required.

set -euo pipefail

RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
CYAN=$'\033[0;36m'
BOLD=$'\033[1m'
NC=$'\033[0m'

die() {
    echo "${RED}Error: $*${NC}" >&2
    exit 1
}

step() {
    echo "${BLUE}==> $*${NC}"
}

DRY_RUN=false
FORCE_TYPE=""
SKIP_CONFIRM=false

for arg in "$@"; do
    case "$arg" in
        --major) FORCE_TYPE="major" ;;
        --minor) FORCE_TYPE="minor" ;;
        --patch) FORCE_TYPE="patch" ;;
        --yes|-y) SKIP_CONFIRM=true ;;
        --dry-run|-n) DRY_RUN=true ;;
        --help|-h)
            echo "MMMF Release Script"
            echo "Usage: $0 [--major|--minor|--patch] [--yes] [--dry-run]"
            echo "Dry-run prints the release plan without changing files or git state."
            echo "GitHub Release creation is handed off to .github/workflows/release.yml."
            exit 0
            ;;
        *) die "Unknown option: $arg" ;;
    esac
done

[ -f CHANGELOG.md ] || die "This script must be run from the project root"
[ -f package.json ] || die "package.json is missing"
command -v git >/dev/null || die "git is not installed"
command -v node >/dev/null || die "node is not installed"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$SKIP_CONFIRM" != true ] && [ "$DRY_RUN" != true ]; then
    echo "${YELLOW}Warning: You are on branch '$CURRENT_BRANCH', not 'main'.${NC}"
    read -r -p "Do you want to continue anyway? (y/n) " CONTINUE
    [ "$CONTINUE" = "y" ] || die "Release process canceled"
fi

if ! git diff-index --quiet HEAD --; then
    git status --short
    die "Working tree has tracked changes; commit or stash them first"
fi

get_current_version() {
    node -p "require('./package.json').version"
}

increment_version() {
    local version=$1
    local part=$2
    IFS='.' read -r -a parts <<< "$version"
    case "$part" in
        major) parts[0]=$((parts[0] + 1)); parts[1]=0; parts[2]=0 ;;
        minor) parts[1]=$((parts[1] + 1)); parts[2]=0 ;;
        patch) parts[2]=$((parts[2] + 1)) ;;
    esac
    echo "${parts[0]}.${parts[1]}.${parts[2]}"
}

VERSION=$(get_current_version)
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || true)
if [ -n "$LATEST_TAG" ]; then
    COMMIT_BODIES=$(git log "${LATEST_TAG}..HEAD" --format=%B)
    [ -n "$COMMIT_BODIES" ] || die "No commits since ${LATEST_TAG}; nothing to release"
else
    COMMIT_BODIES=$(git log --format=%B)
fi

if [ -n "$FORCE_TYPE" ]; then
    RELEASE_TYPE=$FORCE_TYPE
elif printf '%s\n' "$COMMIT_BODIES" | grep -Eq '^[[:space:]]*BREAKING[ -]CHANGE:[[:space:]]+' || \
     printf '%s\n' "$COMMIT_BODIES" | grep -Eq '^[a-z]+(\([^)]*\))?!:'; then
    RELEASE_TYPE="major"
elif printf '%s\n' "$COMMIT_BODIES" | grep -Eq '^feat(\([^)]*\))?:'; then
    RELEASE_TYPE="minor"
else
    RELEASE_TYPE="patch"
fi

NEW_VERSION=$(increment_version "$VERSION" "$RELEASE_TYPE")
TAG="v${NEW_VERSION}"
git rev-parse -q --verify "refs/tags/${TAG}" >/dev/null && die "tag ${TAG} already exists"

UNRELEASED_BODY=$(awk '
    /^## \[Unreleased\]/ { in_unreleased=1; next }
    in_unreleased && /^## \[/ { exit }
    in_unreleased { print }
' CHANGELOG.md | sed '/^[[:space:]]*$/d')
[ -n "$UNRELEASED_BODY" ] || die "CHANGELOG.md [Unreleased] is empty"

echo "${CYAN}Current version: ${BOLD}${VERSION}${NC}"
echo "${CYAN}Release type: ${BOLD}${RELEASE_TYPE}${NC}"
echo "${GREEN}New version: ${BOLD}${NEW_VERSION}${NC}"

if [ "$DRY_RUN" = true ]; then
    echo "${YELLOW}Dry run: no files, commits, tags, or pushes will be changed.${NC}"
    exit 0
fi

if [ "$SKIP_CONFIRM" != true ]; then
    read -r -p "Do you want to release ${TAG}? (y/n) " CONFIRM
    [ "$CONFIRM" = "y" ] || die "Release process canceled"
fi

DATE_TODAY=$(date +%Y-%m-%d)

step "Updating package.json"
npm version "$NEW_VERSION" --no-git-tag-version >/dev/null
git add package.json
if [ -f package-lock.json ]; then
    git add package-lock.json
fi

step "Updating CHANGELOG.md"
CHANGELOG_TMP=$(mktemp)
awk -v version="$NEW_VERSION" -v date="$DATE_TODAY" '
    /^## \[Unreleased\]/ {
        print $0
        print ""
        print "## [" version "] - " date
        in_unreleased=1
        next
    }
    in_unreleased && /^## \[/ { in_unreleased=0 }
    { print }
' CHANGELOG.md > "$CHANGELOG_TMP"
mv "$CHANGELOG_TMP" CHANGELOG.md

LINK_TMP=$(mktemp)
awk -v version="$NEW_VERSION" '
    /^\[Unreleased\]:/ || $0 ~ "^\\[" version "\\]:" { next }
    { print }
    END {
        print "[Unreleased]: https://github.com/jasonyang-ee/MMMF/compare/v" version "...HEAD"
        print "[" version "]: https://github.com/jasonyang-ee/MMMF/releases/tag/v" version
    }
' CHANGELOG.md > "$LINK_TMP"
mv "$LINK_TMP" CHANGELOG.md
git add CHANGELOG.md

step "Committing ${TAG}"
git commit -m "release: ${TAG}"
step "Creating tag ${TAG}"
git tag "$TAG"
step "Pushing branch and tag"
git push origin "$CURRENT_BRANCH"
git push origin "$TAG"

echo "${GREEN}${BOLD}Release ${TAG} complete.${NC}"
echo "GitHub Release creation is handled by .github/workflows/release.yml."
