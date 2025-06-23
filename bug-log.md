Issues found:
* A valid case with content-type that is not 'application/json' (e.g. 'text/plain', application/xml) returns 200 response. Should return 415 (REQ-1).
* patient_name does not accept 3 components, only 2. (REQ-5)
* dob field accepts a string in the format "YYYY-MM-DD" (REQ-6)

Not technically issues but worth flagging:
* tissue_type is case sensitive (REQ-7)
* PUT and PATCH methods also return Case responses
* dob validation accepts future dates (e.g. 01/01/2026) and non-existent leap years (e.g. 29/02/1985)
* sending an incorrect type(e.g. number 123 or array []) for case_id returns a 502 with function details, e.g. 
`{"errorType":"TypeError","errorMessage":"case_to_check.case_id.toLowerCase is not a function","trace":["TypeError: case_to_check.case_id.toLowerCase is not a function","    at Runtime.handler (/var/task/netlify/functions/checkcase.js:52:49)","    at Runtime.handleOnceNonStreaming (file:///var/runtime/index.mjs:1173:29)"]}`