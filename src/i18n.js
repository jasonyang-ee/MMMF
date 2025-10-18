import React, { createContext, useContext, useMemo } from "react";

const translations = {
  en: {
    header: {
      title: "MMMF",
      tagline: "Max Money Market Funds. Forecast Best MMF Deposit Amount.",
      github: "View on GitHub",
      toggleTo: "Español",
    },
    common: {
      cancel: "Cancel",
      add: "Add",
      save: "Save",
      today: "Today",
      selectDate: "Select a date",
      auto: "Auto",
    },
    balance: {
      accountBalance: "Account Balance",
      startingBalance: "Starting Balance",
      forecastedBalance: "Forecasted Balance",
      netChange: "Net Change",
      lowestBalance: "Lowest Balance",
      onDate: "on",
      startingBalanceRow: "Starting Balance",
    },
    forecast: {
      settings: "Forecast Settings",
      currentDate: "Current Date",
      forecastUntil: "Forecast Until",
      quick30: "30 days",
      quick60: "60 days",
      quick90: "90 days",
      daysFromCurrent: "days from current date",
      selectFutureDate: "Select a future date",
      clearAll: "Clear All Transactions",
      clearNote: "This will keep your recurring transactions",
    },
    transactions: {
      addTransaction: "Add Transaction",
      description: "Description",
      amount: "Amount",
      type: "Type",
      debitPayment: "Debit (Payment)",
      creditIncome: "Credit (Income)",
      date: "Date",
      addBtn: "Add Transaction",
      fillAllFields: "Please fill in all fields",
      listTitle: (count) => `Transactions (${count})`,
      noneYet: "No transactions yet",
      getStarted: "Add your first transaction to get started",
      delete: "Delete transaction",
    },
    recurring: {
      title: "Recurring Transactions",
      addButton: "+ Add",
      saveRecurring: "Save Recurring Transaction",
      noRecurring: "No recurring transactions",
      autoNote: "Recurring transactions are auto-generated each month",
      payment: "Payment",
      income: "Income",
      descriptionPh: "Description",
      amountPh: "Amount",
      dayOfMonthPh: "Day of Month (1-31)",
      dayOfMonth: (day) => `Day ${day} of month`,
      clickToEditDesc: "Click to edit description",
      clickToEditAmount: "Click to edit amount",
      deleteRecurring: "Delete recurring transaction",
      validationAll: "Please fill in all fields",
      validationDayRange: "Day of month must be between 1 and 31",
    },
    cards: {
      title: "Recurring Credit Cards",
      saveCard: "Save Credit Card",
      noCards: "No credit cards",
      addNote: "Add credit cards to quickly enter payments",
      cardNamePh: "Card Name (e.g., Chase Sapphire)",
      deleteCard: "Delete credit card",
      dayOfMonth: (day) => `Day ${day} of month`,
      clickToEditName: "Click to edit name",
      next: "Next:",
      addPayment: "Add Payment",
      noUpcoming: "No upcoming date",
      paymentDate: "Payment date:",
      enterAmount: "Please enter amount",
      noUpcomingInRange: "No upcoming payment date within forecast range",
    },
    timeline: {
      title: "Balance Timeline",
      action: "Action",
      description: "Description",
      amount: "Amount",
      balance: "Balance",
      date: "Date",
      delete: "Delete transaction",
    },
    settings: {
      globalSettings: "Global Settings",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      currency: "Currency",
      dateFormat: "Date Format",
    },
    datepicker: {
      weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
  },
  es: {
    header: {
      title: "MMMF",
      tagline:
        "Fondos del Mercado Monetario Máximos. Pronostica el mejor depósito en MMF.",
      github: "Ver en GitHub",
      toggleTo: "English",
    },
    common: {
      cancel: "Cancelar",
      add: "Agregar",
      save: "Guardar",
      today: "Hoy",
      selectDate: "Selecciona una fecha",
      auto: "Auto",
    },
    balance: {
      accountBalance: "Saldo de la cuenta",
      startingBalance: "Saldo inicial",
      forecastedBalance: "Saldo proyectado",
      netChange: "Cambio neto",
      lowestBalance: "Saldo más bajo",
      onDate: "el",
      startingBalanceRow: "Saldo inicial",
    },
    forecast: {
      settings: "Configuración de pronóstico",
      currentDate: "Fecha actual",
      forecastUntil: "Pronosticar hasta",
      quick30: "30 días",
      quick60: "60 días",
      quick90: "90 días",
      daysFromCurrent: "días desde la fecha actual",
      selectFutureDate: "Selecciona una fecha futura",
      clearAll: "Borrar todas las transacciones",
      clearNote: "Se mantendrán las transacciones recurrentes",
    },
    transactions: {
      addTransaction: "Agregar transacción",
      description: "Descripción",
      amount: "Monto",
      type: "Tipo",
      debitPayment: "Débito (Pago)",
      creditIncome: "Crédito (Ingreso)",
      date: "Fecha",
      addBtn: "Agregar transacción",
      fillAllFields: "Por favor completa todos los campos",
      listTitle: (count) => `Transacciones (${count})`,
      noneYet: "Sin transacciones",
      getStarted: "Agrega tu primera transacción para comenzar",
      delete: "Eliminar transacción",
    },
    recurring: {
      title: "Transacciones recurrentes",
      addButton: "+ Agregar",
      saveRecurring: "Guardar transacción recurrente",
      noRecurring: "Sin transacciones recurrentes",
      autoNote: "Las transacciones recurrentes se generan automáticamente cada mes",
      payment: "Pago",
      income: "Ingreso",
      descriptionPh: "Descripción",
      amountPh: "Monto",
      dayOfMonthPh: "Día del mes (1-31)",
      dayOfMonth: (day) => `Día ${day} del mes`,
      clickToEditDesc: "Haz clic para editar la descripción",
      clickToEditAmount: "Haz clic para editar el monto",
      deleteRecurring: "Eliminar transacción recurrente",
      validationAll: "Por favor completa todos los campos",
      validationDayRange: "El día del mes debe estar entre 1 y 31",
    },
    cards: {
      title: "Tarjetas de crédito recurrentes",
      saveCard: "Guardar tarjeta",
      noCards: "Sin tarjetas de crédito",
      addNote: "Agrega tarjetas para ingresar pagos rápidamente",
      cardNamePh: "Nombre de la tarjeta (p. ej., Chase Sapphire)",
      deleteCard: "Eliminar tarjeta",
      dayOfMonth: (day) => `Día ${day} del mes`,
      clickToEditName: "Haz clic para editar el nombre",
      next: "Próximo:",
      addPayment: "Agregar pago",
      noUpcoming: "Sin fecha próxima",
      paymentDate: "Fecha de pago:",
      enterAmount: "Por favor ingresa un monto",
      noUpcomingInRange: "No hay fecha de pago dentro del rango",
    },
    timeline: {
      title: "Línea de tiempo del saldo",
      action: "Acción",
      description: "Descripción",
      amount: "Monto",
      balance: "Saldo",
      date: "Fecha",
      delete: "Eliminar transacción",
    },
    settings: {
      globalSettings: "Configuración global",
      darkMode: "Modo oscuro",
      lightMode: "Modo claro",
      currency: "Moneda",
      dateFormat: "Formato de fecha",
    },
    datepicker: {
      weekdaysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    },
  },
};

const I18nContext = createContext({ language: "en", setLanguage: () => {}, t: (key, ...args) => key });

export function I18nProvider({ language, setLanguage, children }) {
  const t = useMemo(() => {
    return (key, ...args) => {
      const [ns, k] = key.split(":");
      const langTable = translations[language] || translations.en;
      const segments = (k || ns).split(".");
      let node = ns && k ? langTable[ns] : langTable;
      for (const seg of segments) {
        if (!node) break;
        node = node[seg];
      }
      if (typeof node === "function") {
        return node(...args);
      }
      if (typeof node === "string") {
        return node;
      }
      return key; // fallback to key
    };
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  return useContext(I18nContext);
}


