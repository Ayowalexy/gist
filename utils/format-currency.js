
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

module.exports = formatNumber