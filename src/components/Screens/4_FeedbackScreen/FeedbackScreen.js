import React, {useState, useEffect} from 'react'
import './FeedbackScreen.css';
import SearchBar from '../../Common/SearchBar/SearchBar';
import NavigationButton from '../../Common/NavigationButton/NavigationButton';
import { addFeedback } from '../../../backend/FirebaseAPICalls/FirebaseAPI';
import { element } from 'prop-types';

function FeedbackScreen({
  navigateToScreen,
  senderToken,
  receiverToken,
  imageIndex,
  clickPosX,
  clickPosY,
  updateUserClickPosition,
  critiquerName,
  setCritiquerName ,
  formalElement,
  setFormalElement,
  description,
  setDescription, 
  effect,
  setEffect,
  sentiment,
  setSentiment,
  categoryIndex,
  setCategoryIndex,
  categories}) {
  
  const handleCheckboxChange = (categoryIndex) => {
    setCategoryIndex(categoryIndex);
    console.log(categoryIndex);
  };

  const onBackClick = () => {
    updateUserClickPosition(null, null);
    navigateToScreen(3, 0);
  }

  const onNextClick = async () => {
    await addFeedback(
      senderToken, 
      receiverToken, 
      imageIndex, 
      clickPosX, 
      clickPosY, 
      critiquerName, 
      formalElement, 
      description, 
      effect, 
      sentiment, 
      categoryIndex,
    )
    updateUserClickPosition(null, null);
    navigateToScreen(3, 0);
  }

  return (
    <div className="feedbackScreen">
      <div className="feedbackContent">
        <div className="fb-region">
          <SearchBar
            labelText="Critiquer Name"
            placeholder="Enter Your Name"
            showButton={false}
            setTextState={setCritiquerName}
          />
        </div>

        <div className="fb-region">
          <SearchBar
            labelText="Formal Element"
            placeholder="Enter Formal Element"
            showButton={false}
            setTextState={setFormalElement}
          />
        </div>

        <div className="fb-region">
          <SearchBar
            labelText="Description"
            placeholder="Enter Description"
            showButton={false}
            setTextState={setDescription}
          />
        </div>

        <div className="fb-region">
          <SearchBar
            labelText="Effect"
            placeholder="Enter Effect"
            showButton={false}
            setTextState={setEffect}
          />
        </div>

        {/* Sentiment Select */}
        <div className="fb-region">
          <div className="fb-label">
            Select Sentiment
          </div>
          
          <div className="fb-sent">
            <button type="button" className="sentBut sentButPos" style ={{backgroundColor: (sentiment != null && sentiment) ? 'rgba(0,255,0,0.33)' : '#222222'}} onClick={() => {
              setSentiment(true);
            }}>
              Positive
            </button>
            <button type="button" className="sentBut sentButNeg" style ={{backgroundColor: (sentiment != null && sentiment) ? '#222222' : 'rgba(255,0,0,0.33)'}} onClick={() => {
              setSentiment(false);
            }}>
              Negative
            </button>
          </div>
        </div>

        {/* Category Select */}
        <div className="fb-region">
          <div className="fb-label">
            Select A Category
          </div>
          <div className="categories-list">
            {categories.map((category, index) => (
              <div 
              key={index} 
              className="category-item"
              style={{backgroundColor: categoryIndex == index ? '#BF8DFF' : '#222222'}}
              onClick={() => handleCheckboxChange(index)}>
              <div 
                className="category-text"
                style={{fontWeight: categoryIndex == index ? 'bold' : 'normal'}}>
                {category}
              </div>
              {/* <input 
                type="checkbox" 
                className="category-checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCheckboxChange(category)}
              />
              <label htmlFor={`category-${index}`}>{category}</label> */}
            </div>
            ))}
          </div>
        </div>

        <NavigationButton backVisibility={true} backFunction={onBackClick} nextVisibility={true} nextFunction={onNextClick} backText={"Back"} nextText={"Submit"}/>
      </div>
    </div>
  );
}

export default FeedbackScreen;