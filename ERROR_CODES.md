# MilkBoy System Error Codes

| Code                         | Description                                  | HTTP Status                      |
| ---------------------------- | -------------------------------------------- | -------------------------------- |
| **AUTH_MFA_REQUIRED**        | Multi-factor authentication code required    | 200 (Requires TOTP verification) |
| **AUTH_INVALID_CREDENTIALS** | Incorrect email or password                  | 401 Unauthorized                 |
| **AUTH_TOKEN_EXPIRED**       | Access token expired                         | 401 Unauthorized                 |
| **AUTH_TOKEN_INVALID**       | Token invalid or tampered                    | 401 Unauthorized                 |
| **AUTHZ_UNAUTHORIZED**       | Permission check failed                      | 403 Forbidden                    |
| **VAL_MISSING_FIELD**        | Required request payload field missing       | 400 Bad Request                  |
| **VAL_INVALID_INPUT**        | Zod schema validation failed                 | 400 Bad Request                  |
| **RES_NOT_FOUND**            | Database resource not found                  | 404 Not Found                    |
| **RES_CONFLICT**             | Duplicate entity or invalid state transition | 409 Conflict                     |
| **RPT_NOT_READY**            | Report not generated or scan incomplete      | 400 Bad Request                  |
| **SYS_INTERNAL_ERROR**       | Server execution failure                     | 500 Internal Server Error        |
