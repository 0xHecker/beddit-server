"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const validateEmail = (email) => {
    var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(email);
};
const validateRegister = (options) => {
    if (options.username.length < 3) {
        return [
            {
                field: "username",
                message: "username length should bre greater than 2",
            },
        ];
    }
    if (options.password.length < 3) {
        return [
            {
                field: "password",
                message: "password length should be greater than 2",
            },
        ];
    }
    if (options.username.includes("@")) {
        return [
            {
                field: "username",
                message: "username cannot contain symbol @",
            },
        ];
    }
    if (!validateEmail(options.email)) {
        return [
            {
                field: "email",
                message: "invalid email",
            },
        ];
    }
    return null;
};
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map