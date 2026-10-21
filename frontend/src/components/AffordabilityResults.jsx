const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
  
  // Dates from the API are 'YYYY-MM-DD'. Format them in UTC so a date
  // doesn't shift back a day in time zones west of UTC.
  const formatDate = (isoDate) =>
    new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  
  const LIMIT_MESSAGES = {
    housing_ratio:
      'Limited by the 28% guideline: housing costs at or under 28% of gross monthly income.',
    debt_to_income:
      'Limited by your existing debt: all debt payments at or under 36% of gross monthly income.',
    income_ratio:
      'Limited by the 10% guideline: car payments at or under 10% of gross monthly income.',
  };
  
  function Detail({ label, value }) {
    return (
      <div className="result-row">
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>
    );
  }
  
  function AffordabilityResults({ results }) {
    const { mortgage, auto, rates_as_of: ratesAsOf } = results;
  
    return (
      <section className="affordability-results" aria-live="polite">
        <div className="card result-card">
          <h2>Home</h2>
          {mortgage.max_home_price > 0 ? (
            <>
              <p className="result-headline">
                {currency.format(mortgage.max_home_price)}
              </p>
              <dl className="result-details">
                <Detail label="Loan amount" value={currency.format(mortgage.max_loan)} />
                <Detail
                  label="Monthly payment"
                  value={currency.format(mortgage.monthly_payment)}
                />
                <Detail
                  label="Principal and interest"
                  value={currency.format(mortgage.principal_and_interest)}
                />
                <Detail
                  label="Taxes and insurance (est.)"
                  value={currency.format(mortgage.taxes_and_insurance)}
                />
                <Detail
                  label="Rate"
                  value={`${mortgage.rate}%, ${mortgage.term_years}-year fixed`}
                />
              </dl>
            </>
          ) : (
            <p className="result-empty">
              Your current debt payments leave no room for a mortgage payment.
            </p>
          )}
          <p className="result-limit">{LIMIT_MESSAGES[mortgage.limited_by]}</p>
        </div>
  
        <div className="card result-card">
          <h2>Car</h2>
          {auto.max_car_price > 0 ? (
            <>
              <p className="result-headline">
                {currency.format(auto.max_car_price)}
              </p>
              <dl className="result-details">
                <Detail label="Loan amount" value={currency.format(auto.max_loan)} />
                <Detail
                  label="Monthly payment"
                  value={currency.format(auto.monthly_payment)}
                />
                <Detail
                  label="Suggested down payment (20%)"
                  value={currency.format(auto.recommended_down_payment)}
                />
                <Detail
                  label="Rate"
                  value={`${auto.rate}%, ${auto.term_months} months`}
                />
              </dl>
            </>
          ) : (
            <p className="result-empty">
              Your current debt payments leave no room for a car payment.
            </p>
          )}
          <p className="result-limit">{LIMIT_MESSAGES[auto.limited_by]}</p>
        </div>
  
        <p className="result-footnote">
          Rates as of {formatDate(ratesAsOf.mortgage)} (mortgage) and{' '}
          {formatDate(ratesAsOf.auto_loan)} (auto loans), from FRED. Estimates
          only: they exclude PMI, HOA fees, and rate differences based on
          credit. Not financial advice.
        </p>
      </section>
    );
  }
  
  export default AffordabilityResults;
