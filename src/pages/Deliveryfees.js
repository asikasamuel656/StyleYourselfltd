// src/data/deliveryFees.js
//
// Placeholder delivery fees per Nigerian state. Every state currently maps
// to the same placeholder amount (₦2,000) — edit individual values below
// once you have your real per-state pricing. Nothing else in the checkout
// flow needs to change when you update these numbers.

export const DEFAULT_DELIVERY_FEE = 10000;

export const DELIVERY_FEES_BY_STATE = {
  "Abia": DEFAULT_DELIVERY_FEE,
  "Adamawa": DEFAULT_DELIVERY_FEE,
  "Akwa Ibom": DEFAULT_DELIVERY_FEE,
  "Anambra": DEFAULT_DELIVERY_FEE,
  "Bauchi": DEFAULT_DELIVERY_FEE,
  "Bayelsa": DEFAULT_DELIVERY_FEE,
  "Benue": DEFAULT_DELIVERY_FEE,
  "Borno": DEFAULT_DELIVERY_FEE,
  "Cross River": DEFAULT_DELIVERY_FEE,
  "Delta": DEFAULT_DELIVERY_FEE,
  "Ebonyi": DEFAULT_DELIVERY_FEE,
  "Edo": DEFAULT_DELIVERY_FEE,
  "Ekiti": DEFAULT_DELIVERY_FEE,
  "Enugu": DEFAULT_DELIVERY_FEE,
  "FCT (Abuja)": DEFAULT_DELIVERY_FEE,
  "Gombe": DEFAULT_DELIVERY_FEE,
  "Imo": DEFAULT_DELIVERY_FEE,
  "Jigawa": DEFAULT_DELIVERY_FEE,
  "Kaduna": DEFAULT_DELIVERY_FEE,
  "Kano": DEFAULT_DELIVERY_FEE,
  "Katsina": DEFAULT_DELIVERY_FEE,
  "Kebbi": DEFAULT_DELIVERY_FEE,
  "Kogi": DEFAULT_DELIVERY_FEE,
  "Kwara": DEFAULT_DELIVERY_FEE,
  "Lagos": DEFAULT_DELIVERY_FEE,
  "Nasarawa": DEFAULT_DELIVERY_FEE,
  "Niger": DEFAULT_DELIVERY_FEE,
  "Ogun": DEFAULT_DELIVERY_FEE,
  "Ondo": DEFAULT_DELIVERY_FEE,
  "Osun": DEFAULT_DELIVERY_FEE,
  "Oyo": DEFAULT_DELIVERY_FEE,
  "Plateau": DEFAULT_DELIVERY_FEE,
  "Rivers": DEFAULT_DELIVERY_FEE,
  "Sokoto": DEFAULT_DELIVERY_FEE,
  "Taraba": DEFAULT_DELIVERY_FEE,
  "Yobe": DEFAULT_DELIVERY_FEE,
  "Zamfara": DEFAULT_DELIVERY_FEE,
};

// The customer covers this fraction of the delivery fee; the store absorbs
// the rest. Change this single number if the split ratio ever changes.
export const CUSTOMER_DELIVERY_SHARE = 0.7;

export function getDeliveryFee(state) {
  return DELIVERY_FEES_BY_STATE[state] ?? DEFAULT_DELIVERY_FEE;
}