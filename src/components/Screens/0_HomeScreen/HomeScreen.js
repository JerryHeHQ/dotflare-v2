import React, { useState, useRef } from 'react';
import './HomeScreen.css';
import NavBar from '../../Common/NavigationBar/NavigationBar';
import SearchBar from '../../Common/SearchBar/SearchBar'; 
import Logo from '../../Common/logo.svg';
import NavigationButton from '../../Common/NavigationButton/NavigationButton';

function HomeScreen({senderToken, receiverToken, getSessionTokens, enterSession }) {

  const [searchBarText, setSearchBarText] = useState("000000")

  const setTextState = (text) => {
    setSearchBarText(text)
  }

  const [digits, setDigits] = useState(new Array(6).fill(""));
  const inputRefs = useRef(new Array(6).fill(React.createRef()));

  const handleDigitInput = (value, index) => {
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    else if (value.length === 0 && (digits[index] === "" | index > 0)) {
      inputRefs.current[index - 1].focus();
    }
  };

  const onNextClick = () => {
    const searchBarText = digits.join('');
    enterSession(searchBarText);
    console.log(searchBarText)
  }

  const formatToken = (token) => {
    return token ? `${String(token).substring(0, 3)}-${String(token).substring(3)}` : '';
  }

  return (
    <div className="homeScreen">
      <NavBar />
      <div className="content">
        <img src={Logo} alt="Logo" className="logo" />
        <div className="token-inputs">
          {digits.map((digit, index) => (
            <>
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              className="digit-input"
              type="text"
              maxLength="1"
              value={digit}
              onChange={e => handleDigitInput(e.target.value, index)}
              onFocus={e => e.target.select()}
            />
            {index === 2 && <div className="input-dash">-</div>}
            </>
          ))}
        </div>
        <button className="get-code-button" onClick={() => {getSessionTokens()}}>
          <div className="get-code-text">
            Get Session Codes
          </div>
        </button>
        <div className='code-section'>
        <div className='code-container'>
          <div className='code'>
            {formatToken(senderToken)}
          </div>
          <div className='code-label'>
            Sender Code
          </div>
        </div>
        <div className='code-container'>
          <div className='code'>
            {formatToken(receiverToken)}
          </div>
          <div className='code-label'>
            Receiver Code
          </div>
        </div>
        </div>
      </div>
      <NavigationButton backVisibility={false} nextVisibility={true} nextText={"Enter"} nextFunction={onNextClick}/>
    </div>
  );
}

export default HomeScreen;
