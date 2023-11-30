const CHARGE_PERCENT = 30;

const getAdminFee = (amount, admin_charge_percent) => {
  return Math.floor(amount * (admin_charge_percent / 100));
};

module.exports = {
  CHARGE_PERCENT,
  getAdminFee,
};
