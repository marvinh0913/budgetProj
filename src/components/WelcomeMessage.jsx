import '../styles/welcomemessage.css';

function WelcomeMessage() {
  return (
    <header className="welcome" role="banner">
      <h1 className="welcome-heading">Welcome to Budget Proj</h1>
      <p className="welcome-text">
        This website was created for you to calculate a monthly budget based
        your current monthly income and expenses. Once entered there will be a
        personalized budget breakdown, spending analysis, and financial
        suggestions based on the 50/30/20 rule.
      </p>
    </header>
  );
}

export default WelcomeMessage;
