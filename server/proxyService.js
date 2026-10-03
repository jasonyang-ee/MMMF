import { isIP } from "node:net";

export function parseTrustProxy(value) {
  if (value === undefined || value.trim() === "") return false;
  const entries = value.split(",").map((entry) => entry.trim());
  for (const entry of entries) {
    const [address, prefix, ...extra] = entry.split("/");
    const version = isIP(address);
    if (
      !version ||
      extra.length > 0 ||
      (prefix !== undefined &&
        (!/^\d+$/.test(prefix) ||
          Number(prefix) < 1 ||
          Number(prefix) > (version === 4 ? 32 : 128)))
    ) {
      throw new Error(
        "Invalid TRUST_PROXY: use comma-separated IP addresses or CIDRs with nonzero prefixes",
      );
    }
  }
  return entries;
}
