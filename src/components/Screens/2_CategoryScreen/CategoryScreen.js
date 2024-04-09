import React, { useEffect, useState } from 'react';
import './CategoryScreen.css';
import NavigationButton from '../../Common/NavigationButton/NavigationButton';
import { addCategories } from '../../../backend/FirebaseAPICalls/FirebaseAPI';
import SearchBar from '../../Common/SearchBar/SearchBar';

function CategoryScreen( {navigateToScreen, exitSession, senderToken, receiverToken} ) {

  const onBackClick = () => {
    exitSession();
  }

  const onNextClick = async () => {
    try {
      const saveSuccess = await addCategories(senderToken, receiverToken, selectedCategories);
      if (saveSuccess) {
        console.log('Categories saved successfully');
        navigateToScreen(3, 2)
      } else {
        console.error('Failed to save categories');
      }
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }

  const defaultCategories = [
    'Contrast', 'Typography', 'Color', 'Balance', 'Layout', 'Saturation'
  ];
  const [categories, setCategories] = useState(defaultCategories);
  const [selectedCategories, setSelectedCategories] = useState([]);
    // () => {
    // const savedCategories = localStorage.getItem('selectedCategories');
    // return savedCategories ? JSON.parse(savedCategories) : [];

  useEffect(() => {
    // localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
    console.log(selectedCategories.toString())
  }, [selectedCategories]);

  const [newCategory, setNewCategory] = useState('');

  const handleCheckboxChange = (category) => {
    setSelectedCategories(prevSelected => {
      const newSelected = prevSelected.includes(category)
        ? prevSelected.filter(item => item !== category)
        : [...prevSelected, category];
      return newSelected;
    });
  };

  const addCategory = () => {
    if (newCategory) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };


  const setTextState = (text) => {
    setNewCategory(text)
  }

  return (
    <div className="temporary-class">

      <SearchBar 
      labelText="Add Category"
      placeholder="Enter Category Name"
      showButton={true}
      setTextState={setTextState}
      onClick={addCategory}/>

      <div className="categories-list">
        {categories.map((category, index) => (
          <div 
            key={index} 
            className="category-item"
            style={{backgroundColor: selectedCategories.includes(category) ? '#BF8DFF' : '#222222'}}
            onClick={() => handleCheckboxChange(category)}>
            <div 
              className="category-text"
              style={{fontWeight: selectedCategories.includes(category) ? 'bold' : 'normal'}}>
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
      <NavigationButton backVisibility={true} nextVisibility={true} backText={"Home"} nextText={"Confirm"} backFunction={onBackClick} nextFunction={onNextClick}/>
    </div>
  );
}

export default CategoryScreen;