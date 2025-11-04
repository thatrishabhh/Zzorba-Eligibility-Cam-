function toNum(v) { if (v === null || v === undefined) return 0; return Number(String(v).replace(/[^0-9.\-]/g, '')) || 0; }
function ageFromDOB(dobStr) { if (!dobStr) return 0; const dob = new Date(dobStr); if (Number.isNaN(dob.getTime())) return 0; const today = new Date(); let age = today.getFullYear() - dob.getFullYear(); const m = today.getMonth() - dob.getMonth(); if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--; return age; }

function calculateFOIR(companyCategory, salary, pfDed, tdsDed, hasOfficialEmail) {
    const highTier = ['Government', 'Super Cat A'], midTier = ['Cat A', 'Cat B', 'Cat C'], lowTier = ['Cat D', 'Nonlisted'];
    let p;
    if (highTier.includes(companyCategory)) {
        if (salary < 45000) p = 50; else if (salary <= 54999) p = 55; else if (salary <= 59999) p = 60;
        else if (salary <= 69999) p = 65; else if (salary <= 89999) p = 70; else if (salary <= 149999) p = 75; else if (salary >= 150000) p = 75; else p = 50;
    } else if (midTier.includes(companyCategory)) {
        if (salary < 45000) p = 45; else if (salary <= 54999) p = 50; else if (salary <= 59999) p = 55;
        else if (salary <= 69999) p = 60; else if (salary <= 89999) p = 65; else if (salary <= 149999) p = 70; else if (salary >= 150000) p = 75; else p = 45;
    } else if (lowTier.includes(companyCategory)) {
        if (salary < 45000) p = 40; else if (salary <= 54999) p = 45; else if (salary <= 59999) p = 50;
        else if (salary <= 89999) p = 55; else if (salary <= 149999) p = 60; else if (salary >= 150000) p = 65; else p = 40;
    } else { p = 45; }
    if (pfDed === 'yes' || tdsDed === 'yes') p += 5;
    if (hasOfficialEmail === 'yes') p += 5;
    return Math.min(80, Math.max(35, Math.round(p)));
}

function getODLimitEligibilitySalaried(companyCategory, salary) {
    const high = ['Government', 'Super Cat A', 'Cat A', 'Cat B'];
    if (high.includes(companyCategory) && salary >= 50000) return ['Bajaj Finance', 'Tata Capital', 'ABFL', 'Kotak Bank'];
    if (salary >= 100000) return ['Bajaj Finance', 'Tata Capital', 'ABFL'];
    return [];
}
function getPersonalLoanEligibilitySalaried(companyCategory, salary, pfDeducted, tdsDeducted, age) {
    if (age >= 21 && age < 23) return ['Bajaj'];
    const hasPfOrTds = (pfDeducted === 'yes' || tdsDeducted === 'yes');
    if (salary >= 35000 && hasPfOrTds) return ['Bajaj', 'Tata', 'Chola', 'Kotak Bank', 'InCred', 'ICICI', 'Axis', 'IndusInd', 'Shriram Finance', 'Fullerton India', 'HDFC Bank'];
    if (salary >= 35000) return ['InCred', 'Shriram Finance', 'Fullerton India', 'ABFL'];
    return [];
}
function getBusinessLoanEligibility(turnover, gst, itr, license, age) {
    if (age >= 21 && age < 23) { if (turnover >= 5000000 && gst === 'yes' && itr === 'yes') return ['Bajaj', 'Chola']; return []; }
    if (turnover >= 5000000) {
        if (gst === 'yes' && itr === 'yes') return ['Bajaj', 'Tata', 'Chola', 'Indifie', 'ABFL', 'L&T', 'Piramal', 'Godrej', 'Shriram Finance', 'Lending Kart'];
        if (itr === 'yes' && license !== 'N/A') return ['Bajaj', 'Tata', 'Chola', 'InCred', 'Paycence', 'ABFL', 'L&T', 'Godrej', 'Shriram Finance', 'Lending Kart', 'Indifie'];
    }
    return [];
}
function getBusinessODEligibility(turnover, gst, itr, license, age) {
    if (age >= 21 && age < 23) return [];
    if (turnover >= 10000000 && itr === 'yes') return ['Bajaj', 'Tata', 'ABFL', 'L&T', 'Godrej'];
    return [];
}
function determineStatus(data, eligibility, maxLoan) {
    const hasAnyLoan = (eligibility.personalLoan?.length > 0) || (eligibility.businessLoan?.length > 0);
    const hasOD = eligibility.odLimit?.length > 0;
    if (maxLoan <= 0) return 'Ineligible - High Obligations';
    if (hasAnyLoan && hasOD) return 'Eligible - Loan + OD';
    if (hasAnyLoan) return 'Eligible - Loan Only';
    if (hasOD) return 'Eligible - OD Only';
    if (data.recentFunding === 'yes') return 'Review Required - Recent Funding';
    return 'Ineligible - Criteria Not Met';
}
function determineLenders(data, eligibility) {
    const set = new Set();
    [...(eligibility.odLimit || []), ...(eligibility.personalLoan || []), ...(eligibility.businessLoan || [])].forEach(l => set.add(l));
    return Array.from(set);
}
function validateForm(form) {
    const errors = [];
    const name = String(form.custName || '').trim();
    const mobile = String(form.custMobile || '').trim();
    const type = form.customerType === 'business' ? 'business' : 'salaried';
    if (!name) errors.push('Please enter customer name');
    if (!/^[6-9]\d{9}$/.test(mobile)) errors.push('Please enter a valid 10-digit mobile number');
    if (type === 'salaried') {
        const dob = form.dob || ''; let age = toNum(form.age); if (!age) age = ageFromDOB(dob);
        if (!dob) errors.push('Please select date of birth for salaried profile');
        if (age < 21 || age > 58) errors.push('Age must be between 21 and 58 for salaried employees');
        if (toNum(form.salary) <= 0) errors.push('Please enter a valid monthly salary');
    } else {
        const dob = form.dobBusiness || form.dob || ''; let age = toNum(form.age); if (!age) age = ageFromDOB(dob);
        if (!dob) errors.push('Please select date of birth for business profile');
        if (age < 21 || age > 70) errors.push('Age must be between 21 and 70 for business owners');
        if (toNum(form.turnover) <= 0) errors.push('Please enter a valid annual turnover');
    }
    return errors;
}
export function calculateEligibility(formInput = {}) {
    const type = formInput.customerType === 'business' ? 'business' : 'salaried';
    const errors = validateForm(formInput);
    if (errors.length) { const err = new Error('VALIDATION_ERROR'); err.name = 'ValidationError'; err.errors = errors; throw err; }

    const customerData = {
        custName: String(formInput.custName || '').trim(),
        custMobile: String(formInput.custMobile || '').trim(),
        custEmail: String(formInput.custEmail || 'N/A').trim() || 'N/A',
        location: String(formInput.location || 'N/A').trim() || 'N/A',
        customerType: type,
        addrProof: formInput.addrProof || 'Aadhaar Card',
        hasAddressDoc: formInput.hasAddressDoc || 'no',
        recentFunding: formInput.recentFunding || 'no',
        liveUnsecuredLoans: formInput.liveUnsecuredLoans || '0',
        existingLoans: Array.isArray(formInput.existingLoans) ? formInput.existingLoans : []
    };

    let eligibilityResults = { odLimit: [], personalLoan: [], businessLoan: [] };
    let maxFOIRAmount = 0;

    if (type === 'salaried') {
        const salary = toNum(formInput.salary);
        const companyCategory = formInput.companyCategory || formInput.companyCat || 'Nonlisted';
        const pfDeducted = formInput.pfDeducted || formInput.pfDed || 'no';
        const tdsDeducted = formInput.tdsDeducted || formInput.tdsDed || 'no';
        const hasOfficialEmail = formInput.hasOfficialEmail || 'no';
        const age = toNum(formInput.age) || ageFromDOB(formInput.dob);
        const foirAllowed = toNum(formInput.foirAllowed || calculateFOIR(companyCategory, salary, pfDeducted, tdsDeducted, hasOfficialEmail));
        maxFOIRAmount = Math.round(salary * (foirAllowed / 100));
        Object.assign(customerData, { salary, foirAllowed, pfDeducted, tdsDeducted, companyCategory, hasOfficialEmail, age, dob: formInput.dob || '', jobTenure: toNum(formInput.jobTenure), totalExp: toNum(formInput.totalExp) });
        eligibilityResults.personalLoan = getPersonalLoanEligibilitySalaried(companyCategory, salary, pfDeducted, tdsDeducted, customerData.age);
        eligibilityResults.odLimit = getODLimitEligibilitySalaried(companyCategory, salary);
    } else {
        const turnover = toNum(formInput.turnover);
        const profit = toNum(formInput.profit);
        const gst = formInput.gst || 'no';
        const itr = formInput.itr || 'no';
        const license = formInput.license || 'N/A';
        const age = toNum(formInput.age) || ageFromDOB(formInput.dobBusiness || formInput.dob);
        maxFOIRAmount = Math.round((profit / 12) * 0.5);
        Object.assign(customerData, { turnover, profit, gst, itr, license, age, dob: formInput.dobBusiness || formInput.dob || '' });
        eligibilityResults.businessLoan = getBusinessLoanEligibility(turnover, gst, itr, license, age);
        eligibilityResults.odLimit = getBusinessODEligibility(turnover, gst, itr, license, age);
    }

    let totalObligatedEMI = 0, hasBTEligibleLoan = false;
    for (const loan of customerData.existingLoans) {
        const loanType = loan.type || loan.loanType || '';
        const emi = toNum(loan.emi);
        const obligationPercent = toNum(loan.obligationPercent || loan.obligation || 100);
        const btOption = (loan.bt || loan.btOption || 'No');
        if (emi > 0) {
            totalObligatedEMI += (emi * obligationPercent / 100);
            if (loanType !== 'Home Loan' && btOption === 'Yes') hasBTEligibleLoan = true;
        }
    }

    const availableEMIFloat = Math.max(0, maxFOIRAmount - totalObligatedEMI);
    const maxEligibleLoanAmount = Math.round(availableEMIFloat * 40);
    const FOIR_UTILIZATION_THRESHOLD = 0.90;
    let suggestBT = false;
    if (totalObligatedEMI > 0 && maxFOIRAmount > 0 &&
        (totalObligatedEMI / maxFOIRAmount) >= FOIR_UTILIZATION_THRESHOLD &&
        hasBTEligibleLoan) suggestBT = true;

    if (maxEligibleLoanAmount < 500000) eligibilityResults.odLimit = [];

    const result = {
        status: determineStatus(customerData, eligibilityResults, maxEligibleLoanAmount),
        suggestedLenders: determineLenders(customerData, eligibilityResults),
        eligibilityResults,
        maxFOIRAmount,
        totalExistingEMI: Math.round(totalObligatedEMI),
        availableEMI: Math.round(availableEMIFloat),
        maxEligibleLoanAmount,
        suggestBT
    };
    return result;
}

export { calculateFOIR };