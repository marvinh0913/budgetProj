import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import '../styles/faq.css';

const FAQ_ITEMS = [
  {
    question: 'What is this app?',
    answer: [
      'BudgetProj is a budgeting tool that helps you understand your spending habits.',
      'Enter your monthly income and expenses to get a personalized budget breakdown and suggestions based on the 50/30/20 rule.',
      'You can also estimate how much home and car you can afford using current interest rates. No account is needed for any of it.',
    ],
  },
  {
    question: 'Do I need an account?',
    answer: [
      'No. Every feature works without one.',
      'An account is optional. It saves your income, debts, and savings, so the affordability page fills them in automatically on any device you log in from.',
    ],
  },
  {
    question: 'Where does the rate data come from?',
    answer: [
      'Interest rates come from FRED, a free public data service run by the Federal Reserve Bank of St. Louis. They cover mortgage, federal funds, credit card, and auto loan rates.',
      'BudgetProj checks FRED for new rates every Friday.',
      'Each source publishes on its own schedule: mortgage rates weekly, and the others monthly or quarterly. That is why the affordability page shows the date of each rate it uses.',
    ],
  },
  {
    question: 'How is affordability calculated?',
    answer: [
      'Home estimates follow the common 28/36 guideline: housing costs, including estimated property taxes and insurance, at or under 28% of your gross monthly income, and all debt payments at or under 36%.',
      'Car estimates follow the 20/4/10 guideline: a car payment at or under 10% of your gross monthly income.',
      'These are estimates only. They exclude PMI, HOA fees, and rate differences based on your credit, and they are not financial advice.',
    ],
  },
  {
    question: 'What is the 50/30/20 rule?',
    answer: [
      'The 50/30/20 rule is a popular budgeting guideline for dividing your income:',
      '50% to needs (rent, groceries, utilities), 30% to wants (dining, entertainment, shopping), and 20% to savings and investments.',
      'BudgetProj uses this rule to generate personalized budget suggestions based on your actual spending.',
    ],
  },
  {
    question: 'Is my data saved anywhere?',
    answer: [
      "Your home page budget is stored only in your browser's localStorage. It never leaves your device, and clearing your browser data will erase it.",
      'Affordability estimates you run without an account are calculated on our server but never stored.',
      'If you create an account, we store your email, your password in hashed form (never the password itself), and the income, debts, and savings you choose to save.',
    ],
  },
  {
    question: 'How are calculations done?',
    answer: [
      'Your budget breakdown runs in Python directly in your browser, using Pyodide, a Python runtime built on WebAssembly. Your budget never needs to be sent anywhere.',
      'Affordability estimates run on the BudgetProj server, which has the latest interest rates.',
    ],
  },
  {
    question: 'What happens if the server is unavailable?',
    answer: [
      'The budget tools on the home page keep working, since they run in your browser.',
      'The app also remembers the last interest rates it received, so the home page still shows rates.',
      "Affordability estimates and accounts need the server and will work again once it's back.",
    ],
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
              {item.answer.map((paragraph) => (
              <p key={paragraph} className="faq-answer">
                {paragraph}
              </p>
            ))}
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
