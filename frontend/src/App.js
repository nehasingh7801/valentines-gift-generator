import React, { useState } from "react";
import Favicon from "react-favicon";
import "./styles.css";

function App() {
    const heartFavicon = "/love.svg";
    const linkedinLogo = "/social.png";
    const instagramLogo = "/instagram.png";
    const [step, setStep] = useState(0);
    const [category, setCategory] = useState("");
    const [interest, setInterest] = useState("");
    const [personality, setPersonality] = useState("");
    const [relationshipType, setRelationshipType] = useState("");
    const [recommendation, setRecommendation] = useState([]);
    const [warning, setWarning] = useState("");

    const handleNextStep = async () => {
        if ((step === 1 && !category) ||
            (step === 2 && !interest) ||
            (step === 3 && !personality) ||
            (step === 4 && !relationshipType)) {
            setWarning("Please choose one!");
            return;
        }

        setWarning("");

        if (step === 4) {
            try {
                console.log("Submitting request to backend...");

                const response = await fetch("https://valentines-gift-generator.onrender.com", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        category,
                        interest,
                        personality,
                        relationshipType,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Recommended gifts:", data.recommendation);
                setRecommendation(data.recommendation || []);
                setStep(5); // Move to the recommendation slide
            } catch (error) {
                console.error("Error with fetch:", error);
                setRecommendation([]);
            }
        } else {
            setStep(step + 1);
        }
    };

    const renderFormStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="intro">
                        <h1>Let me help you find a gift for your girl, you lazy bums.</h1>
                        <p className="finding-gift-text">Finding the perfect gift is hard, I get it. But don't worry, I got you.</p>
                        <button type="button" onClick={() => setStep(1)}>Let's start</button>
                    </div>
                );
            case 1:
                return (
                    <div>
                        <h2>$ Budget Category:</h2>
                        {["0-500", "500-1000", "1000-2000", "2000-5000", "5000+"].map((value, index) => (
                            <div key={index}>
                                <input type="radio" name="category" value={index + 1} checked={category === (index + 1).toString()} onChange={(e) => setCategory(e.target.value)} />
                                <label>{value}</label>
                            </div>
                        ))}
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h2> What interests her?</h2>
                        {[
                            { label: "Books", value: "Books" },
                            { label: "Music", value: "Music" },
                            { label: "Fashion & Styling", value: "Fashion and Styling" },
                            { label: "Art & DIY", value: "Art & DIY" },
                            { label: "Home Décor", value: "Home Decor" },
                            { label: "Self Care (Nykaa Sale)", value: "Self Care" },
                        ].map((item, index) => (
                            <div key={index}>
                                <input
                                    type="radio"
                                    name="interest"
                                    value={item.value}
                                    checked={interest === item.value}
                                    onChange={(e) => setInterest(e.target.value)}
                                />
                                <label>{item.label}</label>
                            </div>
                        ))}
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h2>What is she like (personality and style)?</h2>
                        {["Quirky", "Simple", "Bold", "Artistic", "Adventurous", "Soft & Feminine", "Vibrant", "Funny"].map((value, index) => (
                            <div key={index}>
                                <input
                                    type="radio"
                                    name="personality"
                                    value={value}
                                    checked={personality === value}
                                    onChange={(e) => setPersonality(e.target.value)}
                                />
                                <label>{value}</label>
                            </div>
                        ))}
                    </div>
                );
            case 4:
                return (
                    <div>
                        <h2>Relationship type:</h2>
                        {["Sentimental (Loves personalized gifts)", "Practical (Loves useful gifts)", "Low-key (Doesn’t like extravagant gifts)", "Extravagant (Loves big surprises, expensive gifts)"].map((value, index) => (
                            <div key={index}>
                                <input
                                    type="radio"
                                    name="relationshipType"
                                    value={value}
                                    checked={relationshipType === value}
                                    onChange={(e) => setRelationshipType(e.target.value)}
                                />
                                <label>{value}</label>
                            </div>
                        ))}
                    </div>
                );
                case 5:
                    return (
                        <div className="recommendation-container">
                            <h2>Your Recommended Gifts:</h2>
                            <div className="gift-list">
                                {recommendation.map((gift, index) => (
                                    <div key={index} className="gift-box">{gift}</div>
                                ))}
                            </div>
                            <button classname="reset-button" type="button" onClick={() => setStep(0)}>Start Over</button>
                        </div>
                    );
                default:
                    return null;
        }
    };

    return (
        <div className="app">
            <Favicon url={heartFavicon} />
            <div className="navbar">
                <h1>Lazy Gifting.</h1>
            </div>
            <div className="content">
                {renderFormStep()}
                {warning && <p className="warning">{warning}</p>}
                {step > 0 && step < 5 && (
                    <button type="button" onClick={handleNextStep}>
                        {step === 4 ? "Get Recommendation" : "Next →"}
                    </button>
                )}
            </div>
            <footer className="footer">
                <p className="footer-text">
                    Made with love for love by Neha <span className="heart">❤️</span>
                </p>
                <div className="social-icons">
                    <a href="https://www.linkedin.com/in/i-am-neha-singh/" target="_blank" rel="noopener noreferrer">
                        <img src={linkedinLogo} alt="LinkedIn" />
                    </a>
                    <a href="https://www.instagram.com/nehasingh.py/" target="_blank" rel="noopener noreferrer">
                        <img src={instagramLogo} alt="Instagram" />
                    </a>
                </div>
            </footer>
        </div>
    );
}

export default App;
