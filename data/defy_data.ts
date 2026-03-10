export const DEFY_LOAN_TYPES = [
  {
    "loan_type": "NonQM",
    "rules": [
      "Primary, Second Home, and Investor occupancies allowed.",
      "Max LTV based on FICO and loan size.",
      "Alt-doc income allowed.",
      "DTI max 50% (55% Primary).",
      "Reserves scale with loan amount."
    ]
  },
  {
    "loan_type": "DSCR",
    "rules": [
      "Business purpose, non-owner occupied only.",
      "Minimum DSCR 1.00.",
      "Vacant properties ineligible for R/T or CO.",
      "5% LTV reduction in declining markets.",
      "Reserves 3–6 months PITIA."
    ]
  },
  {
    "loan_type": "Smart Equity",
    "rules": [
      "Closed-end fixed-rate second mortgage.",
      "Standalone second lien only.",
      "Max CLTV varies by occupancy.",
      "No exceptions permitted.",
      "Recently listed properties are ineligible."
    ]
  }
];

export const DEFY_GUIDELINES = [
  {
    "section": "Defy Offers Several Loan Programs",
    "rules": ["Defy NonQM (Series A - D)"]
  },
  {
    "section": "Itin",
    "rules": ["Subprime", "Smart Equity (HELOAN IQ & HELOAN DSCR"]
  },
  {
    "section": "Documentation Types",
    "rules": [
      "Full Documentation: 1- or 2-years W-2s or tax returns",
      "Alternative Income: Personal/Business Bank Statements, 1099s, or 1-Year P&L",
      "Investor: DSCR / Business Purpose"
    ]
  },
  {
    "section": "Products",
    "rules": ["30yr Fixed, 40yr Fixed, Interest Only 30/20, Interest Only 40/30, 15yr Fixed"]
  },
  {
    "section": "Prepayment Penalties",
    "rules": [
      "Total points/fees/APR may not exceed state/federal high-cost thresholds.",
      "Prepay penalties allowed on investment properties where permitted.",
      "Prohibited on primary residence and second homes."
    ]
  },
  {
    "section": "Exceptions",
    "rules": [
      "Considered on case-by-case basis with strong compensating factors.",
      "Must be submitted in writing on Defy Exception Request Form."
    ]
  },
  {
    "section": "Primary Residence Criteria",
    "rules": [
      "Located in same general area as employment",
      "Borrower intends to occupy for majority of year",
      "Possesses physical characteristics accommodating borrower's family"
    ]
  },
  {
    "section": "Second Home Criteria",
    "rules": [
      "Reasonable distance from primary residence",
      "Occupied for portion of year",
      "Suitable for year-round occupancy",
      "Exclusive control (no timeshares/rental pools)"
    ]
  },
  {
    "section": "Investment Property",
    "rules": [
      "Income-producing property borrower does not occupy.",
      "Requires signed Business Purpose & Occupancy Affidavit."
    ]
  },
  {
    "section": "Cash-Out Refinance",
    "rules": [
      "If property acquired < 6 months from note date: use lesser of appraisal or purchase price + improvements.",
      "If >= 6 months but < 12 months: Appraised value allowed if Clear Capital CDA/Field Review score <= 2.5 and Max 75% LTV.",
      "Listing for sale in past 6 months requires 5% LTV reduction."
    ]
  },
  {
    "section": "Rate/Term Refinance",
    "rules": [
      "Limited to existing first payoff + closing costs + subordinate liens used for purchase.",
      "Cash back limited to lesser of 2% of new loan or $2,000."
    ]
  },
  {
    "section": "Flip Transactions",
    "rules": [
      "Resale within 365 days with >10% price increase is a flip.",
      "Must be arm's length.",
      "No pattern of previous flipping in last 12 months.",
      "Second appraisal required if >10% increase (acquired 0-90 days) or >20% increase (acquired 91-180 days)."
    ]
  },
  {
    "section": "Credit Score Requirements",
    "rules": [
      "Primary wage earner score used as Representative Score.",
      "Middle of 3 or lower of 2 scores.",
      "If income equal, highest Representative Score of all borrowers used."
    ]
  },
  {
    "section": "Tradeline Requirements",
    "rules": [
      "Must be on credit report, activity in past 12 months.",
      "No > 0x60 in last 12 months.",
      "3 tradelines reporting for 12+ months OR 2 for 24+ months."
    ]
  },
  {
    "section": "Housing Events",
    "rules": [
      "Foreclosure, DIL, Short Sale, Modification, 1x120 mortgage history.",
      "Seasoning: NonQM (48 months), Subprime (0-24 months per matrix)."
    ]
  },
  {
    "section": "Debt-to-Income (DTI)",
    "rules": [
      "Max 50% generally.",
      ">50% to 55% allowed for NonQM Primary Residence, Min 700 FICO, Max 80% LTV."
    ]
  },
  {
    "section": "Self-Employed Income",
    "rules": [
      "Self-employed >= 2 years, business >= 2 years.",
      "Bank Statements: 12 or 24 months personal/business.",
      "P&L: 1-Year P&L prepared by CPA/EA/CTEC."
    ]
  },
  {
    "section": "DSCR Program",
    "rules": [
      "Investment only.",
      "Min DSCR 1.00 (Foreign National 1.00).",
      "DSCR = Gross Income / Proposed PITIA.",
      "Short-term rentals allowed (requires Property Guard Report & AirDNA)."
    ]
  },
  {
    "section": "Smart Equity Program",
    "rules": [
      "Standalone closed-end second lien.",
      "Max CLTV per matrix.",
      "No prepayment penalties."
    ]
  },
  {
    "section": "Appraisal Requirements",
    "rules": [
      "Completed within 12 months of note date.",
      "Review products: CDA, Field Review, or CU score <= 2.5.",
      "2nd appraisal required for Loan Amount > $2M or Flips."
    ]
  }
];