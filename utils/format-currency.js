

let DECIMAL_SEPARATOR = '.';
let GROUP_SEPARATOR = ',';

const formatNumber = (valString, mode = false) => {
    if (!valString) {
        return '';
    }

    if (mode) {
        let val = valString.toString();
        const parts = unFormatNumber(val).split(DECIMAL_SEPARATOR);

        var res =
            parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, GROUP_SEPARATOR) +
            (!parts[1] ? '' : DECIMAL_SEPARATOR + parts[1]);

        return res;
    } else {
        let val = valString.toString();

        const parts = unFormatNumber(val).split(DECIMAL_SEPARATOR);

        var res =
            parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, GROUP_SEPARATOR) +
            (!parts[1] ? '' : DECIMAL_SEPARATOR + parts[1]);

        return res;
    }
};


const unFormatNumber = (val) => {
    if (typeof val === 'number') {
      return val;
    }
    if (!val) {
      return '';
    }
    val = val.replace(/^0+/, '');
  
    if (GROUP_SEPARATOR === ',') {
      return val.replace(/,/g, '');
    } else {
      return val.replace(/\./g, '');
    }
  };
  

module.exports = formatNumber