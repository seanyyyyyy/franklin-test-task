Valid case data
* example case
* name with 3 components
* all valid tissue types
* all valid check digits
* all valid patient_id assigning authorities
* valid identifier type code (randomised)

Invalid case data
* case_id: not uuid
* patient_name: no delimiter, too many components
* dob: invalid formats
* tissue_type: invalid tissue type
* patient_id: invalid ID number, number of components, check digit, assigning_authority, id_type_code, assigning facility 

Error handling
* invalid content-type 
* missing content-type header
* missing mandatory fields

Non-functional
* Performance? estimated user load + any response time requirements?
* Security? No auth on endpoint currently