import {expect, test} from "@playwright/test";

const endpoint = 'https://lucent-trifle-ba3d62.netlify.app/.netlify/functions/checkcase';

test.describe('Valid case data', () => {
    const expectedStatus = 200;

    test('check valid example case', async ({request}) => {
        const newCase = await request.post(endpoint, {
            // headers: {
            //     'Content-Type': 'application/json'
            // },
            data: {
                case_id: 'a474e3e6-89ad-4bb9-be00-cba347e2a001',
                patient_id: "1234567^1^ISO^NN123^MC",
                patient_name: "Smith^John",
                dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Case valid'
        });
    });

    test('check patient_name with 3 components', async ({request}) => {
        const newCase = await request.post(endpoint, {
            data: {
                case_id: crypto.randomUUID(),
                patient_id: "1234567^1^ISO^NN123^MC",
                patient_name: "Smith^John^James",
                dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(200);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Case valid'
        });
    });

    // Check all valid tissue types
    [
        {tissue_type: 'prostate'},
        {tissue_type: 'breast'},
        {tissue_type: 'colorectal'},
        {tissue_type: 'skin'},
    ].forEach(({tissue_type}) => {
        test(`tissue_type: ${tissue_type}`, async ({request}) => {
            const newCase = await request.post(endpoint, {
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    case_id: crypto.randomUUID(),
                    patient_id: "1234567^1^ISO^NN123^MC",
                    patient_name: "Smith^John",
                    dob: "19700401",
                    tissue_type: tissue_type
                }
            });
            expect(newCase.status()).toEqual(expectedStatus);
            const newCaseBody = await newCase.json();
            expect(newCaseBody).toEqual({
                message: 'Case valid'
            });
        });
    });

    // Check all check digits
    [
        {check_digit: '0'},
        {check_digit: '1'},
    ].forEach(({check_digit}) => {
        test(`check_digit: ${check_digit}`, async ({request}) => {
            const newCase = await request.post(endpoint, {
                data: {
                    case_id: crypto.randomUUID(),
                    patient_id: `1234567^${check_digit}^ISO^NN123^MC`,
                    patient_name: "Smith^John",
                    dob: "19700401",
                    tissue_type: 'prostate'
                }
            });
            expect(newCase.status()).toEqual(expectedStatus);
            const newCaseBody = await newCase.json();
            expect(newCaseBody).toEqual({
                message: 'Case valid'
            });
        });
    });

    // Check all valid patient_id assigning authorities
    [
        {assigning_authority: 'BCV'},
        {assigning_authority: 'ISO'},
        {assigning_authority: 'M10'},
        {assigning_authority: 'M11'},
        {assigning_authority: 'NPI'},
    ].forEach(({assigning_authority}) => {
        test(`assigning_authority: ${assigning_authority}`, async ({request}) => {
            const newCase = await request.post(endpoint, {
                data: {
                    case_id: crypto.randomUUID(),
                    patient_id: `1234567^1^${assigning_authority}^NN123^MC`,
                    patient_name: "Smith^John",
                    dob: "19700401",
                    tissue_type: 'prostate'
                }
            });
            expect(newCase.status()).toEqual(expectedStatus);
            const newCaseBody = await newCase.json();
            expect(newCaseBody).toEqual({
                message: 'Case valid'
            });
        });
    });

    test('valid identifier type code', async ({request}) => {
        const idLetters = generateRandomTwoLetterString();
        const idNumber = Math.floor(Math.random() * 900) + 100;

        const newCase = await request.post(endpoint, {
            data: {
                case_id: crypto.randomUUID(),
                patient_id: `1234567^1^ISO^${idLetters}${idNumber}^MC`,
                patient_name: "Smith^John",
                dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(200);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Case valid'
        });
    });
});

test.describe('Invalid case data', () => {
    const expectedStatus = 422;

    test('case id: not a uuid', async ({request}) => {
        const newCase = await request.post(endpoint, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                case_id: 'not a uuid',
                patient_id: "1234567^1^ISO^NN123^MC",
                patient_name: "Smith^John",
                dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Invalid case_id'
        });
    });

    test('patient_name: no delimiter', async ({request}) => {
        const newCase = await request.post(endpoint, {
            data: {
                case_id: crypto.randomUUID(),
                patient_id: "1234567^1^ISO^NN123^MC",
                patient_name: "John Smith", // Should use ^ delimiter
                dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Invalid patient_name'
        });
    });

    test('patient_name: too many components', async ({request}) => {
        const newCase = await request.post(endpoint, {
            data: {
                case_id: crypto.randomUUID(),
                patient_id: "1234567^1^ISO^NN123^MC",
                patient_name: "Smith^John^Middle^Extra",
                dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Invalid patient_name'
        });
    });

    test('dob: invalid format YYYY-MM-DD', async ({request}) => {
        const newCase = await request.post(endpoint, {
            data: {
                case_id: crypto.randomUUID(),
                patient_id: "1234567^1^ISO^NN123^MC",
                patient_name: "Smith^John",
                dob: "1970-04-01", // Should be YYYYMMDD format
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Invalid dob'
        });
    });

    test('dob: invalid format DDMMYYYY', async ({request}) => {
        const newCase = await request.post(endpoint, {
            data: {
                case_id: crypto.randomUUID(),
                patient_id: "1234567^1^ISO^NN123^MC",
                patient_name: "Smith^John",
                dob: "01041970", // Should be YYYYMMDD format
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Invalid dob'
        });
    });

    test('tissue_type: invalid type', async ({request}) => {
        const newCase = await request.post(endpoint, {
            data: {
                case_id: crypto.randomUUID(),
                patient_id: "1234567^1^ISO^NN123^MC",
                patient_name: "Smith^John",
                dob: "19700401",
                tissue_type: "liver" // Not in the allowed list
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Invalid tissue_type'
        });
    });
});

test.describe('Invalid patient_id data', () => {
    const expectedStatus = 422;

    test('reject ID number with more than 15 digits', async ({request}) => {
        const newCase = await request.post(endpoint, {
            data: {
                case_id: crypto.randomUUID(),
                patient_id: "1234567890123456^1^ISO^NN123^MC", // 16 digits
                patient_name: "Smith^John",
                dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Invalid patient_id'
        });
    });

    test('reject wrong number of components', async ({request}) => {
        const newCase = await request.post(endpoint, {
            data: {
                case_id: crypto.randomUUID(),
                patient_id: "1234567^1^ISO^NN123", // Missing MC component
                patient_name: "Smith^John",
                dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Invalid patient_id'
        });
    });

    test('reject invalid check digit', async ({request}) => {
        const checkDigit = Math.floor(Math.random() * 8) + 2; // Digit between 2-9

        const newCase = await request.post(endpoint, {
            data: {
                case_id: crypto.randomUUID(),
                patient_id: `1234567^${checkDigit}^ISO^NN123^MC`,
                patient_name: "Smith^John",
                dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Invalid patient_id'
        });
    });

    [
        {assigning_authority: ''},
        {assigning_authority: '!!!'},
        {assigning_authority: 'AAA'},
        {assigning_authority: '111'},
        {assigning_authority: 'A11'},
    ].forEach(({assigning_authority}) => {
        test(`reject invalid assigning authority: ${assigning_authority}`, async ({request}) => {
            const newCase = await request.post(endpoint, {
                data: {
                    case_id: crypto.randomUUID(),
                    patient_id: `1234567^1^${assigning_authority}^NN123^MC`,
                    patient_name: "Smith^John",
                    dob: "19700401",
                    tissue_type: "prostate"
                }
            });
            expect(newCase.status()).toEqual(expectedStatus);
            const newCaseBody = await newCase.json();
            expect(newCaseBody).toEqual({
                message: 'Invalid patient_id'
            });
        });
    });

    [
        {id_type_code: ''},
        {id_type_code: 'AB12'},
        {id_type_code: 'ABC12'},
        {id_type_code: 'AAAAA'},
        {id_type_code: '11111'},
        {id_type_code: '!!!!!'},
        {id_type_code: 'ABC123'},
        {id_type_code: 'ABC123ABC123'},
    ].forEach(({id_type_code}) => {
        test(`reject invalid identifier type code: ${id_type_code}`, async ({request}) => {
            const newCase = await request.post(endpoint, {
                data: {
                    case_id: crypto.randomUUID(),
                    patient_id: `1234567^1^ISO^${id_type_code}^MC`, // Should be 2 letters + 3 digits
                    patient_name: "Smith^John",
                    dob: "19700401",
                    tissue_type: "prostate"
                }
            });
            expect(newCase.status()).toEqual(expectedStatus);
            const newCaseBody = await newCase.json();
            expect(newCaseBody).toEqual({
                message: 'Invalid patient_id'
            });
        });
    });

    test('reject wrong assigning facility', async ({request}) => {
        let assigningFacility = generateRandomTwoLetterString();
        if (assigningFacility === 'MC') {
            assigningFacility = 'CM';
        }

        const newCase = await request.post(endpoint, {
            data: {
                case_id: crypto.randomUUID(),
                patient_id: `1234567^1^ISO^NN123^${assigningFacility}`, // Should be MC
                patient_name: "Smith^John",
                dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Invalid patient_id'
        });
    });
});

test.describe('Invalid content type', () => {
    const expectedStatus = 415;

    [
        {content_type: 'application/xml'},
        {content_type: 'text/plain; charset=UTF-8'}
    ].forEach(({content_type}) => {
        test(`reject non-JSON content type: ${content_type}`, async ({request}) => {
            const response = await request.post(endpoint, {
                headers: {
                    'Content-Type': `${content_type}`
                },
                data: {
                    case_id: crypto.randomUUID(),
                    patient_id: "1234567^1^ISO^NN123^MC",
                    patient_name: "Smith^John",
                    dob: "19700401",
                    tissue_type: "prostate"
                }
            });
            expect(response.status()).toEqual(expectedStatus);
        });
    });

    test('no Content-Type header', async ({request}) => {
        const response = await request.post(endpoint, {
            headers: {},
            data: {
                case_id: crypto.randomUUID(),
                patient_id: "1234567^1^ISO^NN123^MC",
                patient_name: "Smith^John",
                dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(response.status()).toEqual(expectedStatus);
    });
});

test.describe('Check mandatory fields', () => {
    const expectedStatus = 400;

    test('check mandatory field: case_id', async ({request}) => {
        const newCase = await request.post(endpoint, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                //case_id: 'a474e3e6-89ad-4bb9-be00-cba347e2a001',
                patient_id: "1234567^1^ISO^NN123^MC",
                patient_name: "Smith^John",
                dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Missing case id'
        });
    });

    test('check mandatory field: patient_id', async ({request}) => {
        const newCase = await request.post(endpoint, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                case_id: crypto.randomUUID(),
                //patient_id: "1234567^1^ISO^NN123^MC",
                patient_name: "Smith^John",
                dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Missing patient_id'
        });
    });

    test('check mandatory field: patient_name', async ({request}) => {
        const newCase = await request.post(endpoint, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                case_id: crypto.randomUUID(),
                patient_id: "1234567^1^ISO^NN123^MC",
                //patient_name: "Smith^John",
                dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Missing patient_name'
        });
    });
    test('check mandatory field: dob', async ({request}) => {
        const newCase = await request.post(endpoint, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                case_id: crypto.randomUUID(),
                patient_id: "1234567^1^ISO^NN123^MC",
                patient_name: "Smith^John",
                //dob: "19700401",
                tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Missing dob'
        });
    });

    test('check mandatory field: tissue_type', async ({request}) => {
        const newCase = await request.post(endpoint, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                case_id: crypto.randomUUID(),
                patient_id: "1234567^1^ISO^NN123^MC",
                patient_name: "Smith^John",
                dob: "19700401",
                //tissue_type: "prostate"
            }
        });
        expect(newCase.status()).toEqual(expectedStatus);
        const newCaseBody = await newCase.json();
        expect(newCaseBody).toEqual({
            message: 'Missing tissue_type'
        });
    });
});

function generateRandomTwoLetterString(uppercase: boolean = true): string {
    const letters = uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'abcdefghijklmnopqrstuvwxyz';
    const firstLetter = letters[Math.floor(Math.random() * letters.length)];
    const secondLetter = letters[Math.floor(Math.random() * letters.length)];
    return firstLetter + secondLetter;
}
