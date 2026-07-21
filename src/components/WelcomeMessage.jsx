import '../styles/welcomemessage.css';

function WelcomeMessage() {
  return (
    <header className="welcome" role="banner">
      <h1 className="welcome-heading">Welcome to Budget Proj</h1>
      <p className="welcome-text">
        This website was created for you to be able to add your current monthly 
        expenses and get a personalized budget breakdown, spending analysis, 
        and financial suggestions based on the 50/30/20 rule.
      </p>
    </header>
  );
}

export default WelcomeMessage;