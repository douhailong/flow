/** 正则 */
export default {
    phone: /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/,
    idCardNumber: /^([1-6][1-9]|50)\d{4}(18|19|20)\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
    routePath: /\/[a-zA-Z0-9-_/]*/,
    /** 强密码（长度为8位以上，包含数字和大小写） */
    // strong_password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/,
    password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,16}$/,
    mouthPas: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,16}$/,
    // password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!#$%])[a-zA-Z0-9!#$%]{8,20}$/,
    account: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/,
    template: /^[a-z\d]{1,20}$/i
};
