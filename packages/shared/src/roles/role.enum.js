"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_ROLES = exports.Role = void 0;
var Role;
(function (Role) {
    Role["APPLICANT"] = "APPLICANT";
    Role["REVIEWER"] = "REVIEWER";
    Role["APPROVER"] = "APPROVER";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
exports.ALL_ROLES = Object.freeze([
    Role.APPLICANT,
    Role.REVIEWER,
    Role.APPROVER,
    Role.ADMIN,
]);
//# sourceMappingURL=role.enum.js.map