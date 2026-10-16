import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import '../styles/faq.css';

const FAQ_ITEMS = [
  {
    question: 'What is this app?',
    answer:
      'BudgetProj is a budgeting tool that helps you understand your spending habits. Enter your monthly income and expenses to get a personalized budget breakdown and financial suggestions based on the 50/30/20 rule. No account needed — everything runs directly in your browser.',
  },
  {
    question: 'Where does the rate data come from?',
    answer:
      'Interest rate data is fetched directly from the Federal Reserve Bank of St. Louis (FRED) — a free, public API maintained by the US Federal Reserve. This includes mortgage rates, federal funds rates, credit card rates, and auto loan rates. Data is updated based on how frequently FRED publishes each rate.',
  },
  {
    question: 'What is the 50/30/20 rule?',
    answer:
      'The 50/30/20 rule is a popular budgeting guideline that suggests allocating 50% of your income to needs (rent, groceries, utilities), 30% to wants (dining, entertainment, shopping), and 20% to savings and investments. BudgetProj uses this rule to generate personalized budget suggestions based on your actual spending.',
  },
  {
    question: 'Is my data saved anywhere?',
    answer:
      "Your data is stored only in your browser's localStorage — it never leaves your device or gets sent to any server. This means your budget data is private by design. However, clearing your browser data will erase it, so consider exporting your data if you want to keep a record.",
  },
  {
    question: 'How are calculations done?',
    answer:
      'All budget and interest calculations are performed client-side using Python via Pyodide — a Python runtime that runs directly in your browser using WebAssembly. This means no server is needed for calculations, and your data never needs to be transmitted anywhere to be processed.',
  },
  {
    question: 'What does cache mean?',
    answer:
      "When BudgetProj fetches interest rates from FRED, it saves them temporarily in your browser's localStorage — this is called caching. On your next visit, the app checks if the cached rates are still fresh before making another network request. Mortgage rates cache for 24 hours, federal funds rates for 7 days, credit card rates for 30 days, and auto loan rates for 7 days.",
  },
];

function FAQ() {
  return (
    <div className="faq">
      <NavBar />
      <div className="container page">
        <h1 className="faq-heading">Frequently Asked Questions</h1>
        <div className="faq-list">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="faq-item card">
              <h2 className="faq-question">{item.question}</h2>
              <p className="faq-answer">{item.answer}</p>
            </div>
          ))}
        </div>
        <Link to="/" className="btn btn-primary faq-back-link">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default FAQ;
