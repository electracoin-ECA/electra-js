export declare const CURRENCIES: {
    AUD: "AUD";
    BRL: "BRL";
    BTC: "BTC";
    CAD: "CAD";
    CHF: "CHF";
    CLP: "CLP";
    CNY: "CNY";
    CZK: "CZK";
    DKK: "DKK";
    EUR: "EUR";
    GBP: "GBP";
    HKD: "HKD";
    HUF: "HUF";
    IDR: "IDR";
    ILS: "ILS";
    INR: "INR";
    JPY: "JPY";
    KRW: "KRW";
    MXN: "MXN";
    MYR: "MYR";
    NOK: "NOK";
    NZD: "NZD";
    PHP: "PHP";
    PKR: "PKR";
    PLN: "PLN";
    RUB: "RUB";
    SEK: "SEK";
    SGD: "SGD";
    THB: "THB";
    TRY: "TRY";
    TWD: "TWD";
    USD: "USD";
    ZAR: "ZAR";
};
export declare type CoinMarketCapCurrency = keyof typeof CURRENCIES;
/**
 * Get the current price of ECA via CoinMarketCap.
 */
export default function (currency?: CoinMarketCapCurrency): Promise<number>;
