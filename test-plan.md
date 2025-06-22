Valid cases
* check valid cases

Error handling
* invalid content type
* submit invalid case

Non-functional
* ?

Exploratory
* try and break it


* REQ-1: the endpoint should accept a HTTP POST request containing JSON describing a Case; content types other than JSON should be rejected with code 415 (Unsupported media)
* REQ-2: the following properties for a Case are mandatory: case_id, patient_id, patient_name, dob and tissue_type 
* REQ-3: case_id should be a UUID 
* REQ-4: patient_id should be a string, with 5 components, delimited by the ^ symbol. The components are:
  ID Number - number, with up to 15 digits
  Check Digit Flag - always 0 or 1
  Assigning Authority - 3 character code, from the following set BCV, ISO, M10, M11, NPI
  Identifier Type Code - 5 character string; 2 letters and 3 digits
  Assigning Facility - always the string MC
  Example patient_id: 1234567^1^ISO^NN123^MC

* REQ-5: patient_name should be a string, with 2 or 3 components, in the form surname^firstname, surname^firstname^middlename

* REQ-6: dob should be the patient date of birth, in the form YYYYMMDD

* REQ-7: tissue_type should be one of the following strings: prostate, breast, colorectal, or skin

Note: fields from REQ 2-7 in the wrong format should be rejected with code 422 (Unprocessable content).

* REQ-8: A valid Case should receive code 200, with body { message: "Case valid" }