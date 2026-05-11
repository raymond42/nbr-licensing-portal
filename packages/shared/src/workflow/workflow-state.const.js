"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TERMINAL_STATES = exports.WORKFLOW_TRANSITIONS = void 0;
const application_status_enum_1 = require("../enums/application-status.enum");
const role_enum_1 = require("../roles/role.enum");
exports.WORKFLOW_TRANSITIONS = Object.freeze([
    { from: application_status_enum_1.ApplicationStatus.DRAFT, to: application_status_enum_1.ApplicationStatus.SUBMITTED, allowedRoles: [role_enum_1.Role.APPLICANT] },
    { from: application_status_enum_1.ApplicationStatus.SUBMITTED, to: application_status_enum_1.ApplicationStatus.UNDER_REVIEW, allowedRoles: [role_enum_1.Role.REVIEWER] },
    { from: application_status_enum_1.ApplicationStatus.UNDER_REVIEW, to: application_status_enum_1.ApplicationStatus.PENDING_APPROVAL, allowedRoles: [role_enum_1.Role.REVIEWER] },
    { from: application_status_enum_1.ApplicationStatus.UNDER_REVIEW, to: application_status_enum_1.ApplicationStatus.REJECTED, allowedRoles: [role_enum_1.Role.REVIEWER] },
    { from: application_status_enum_1.ApplicationStatus.PENDING_APPROVAL, to: application_status_enum_1.ApplicationStatus.APPROVED, allowedRoles: [role_enum_1.Role.APPROVER] },
    { from: application_status_enum_1.ApplicationStatus.PENDING_APPROVAL, to: application_status_enum_1.ApplicationStatus.REJECTED, allowedRoles: [role_enum_1.Role.APPROVER] },
    { from: application_status_enum_1.ApplicationStatus.DRAFT, to: application_status_enum_1.ApplicationStatus.WITHDRAWN, allowedRoles: [role_enum_1.Role.APPLICANT] },
    { from: application_status_enum_1.ApplicationStatus.SUBMITTED, to: application_status_enum_1.ApplicationStatus.WITHDRAWN, allowedRoles: [role_enum_1.Role.APPLICANT] },
]);
exports.TERMINAL_STATES = Object.freeze([
    application_status_enum_1.ApplicationStatus.APPROVED,
    application_status_enum_1.ApplicationStatus.REJECTED,
    application_status_enum_1.ApplicationStatus.WITHDRAWN,
]);
//# sourceMappingURL=workflow-state.const.js.map