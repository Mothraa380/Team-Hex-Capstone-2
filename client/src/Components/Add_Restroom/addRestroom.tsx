import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTextSize } from '../../TextSizeContext.js';
import './addRestroom.css';

function AddRestroom() {
    let navigate = useNavigate();

  const [formState, setFormState] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    country: '',
    accessible: '',
    unisex: '',
    changingTable: '',
    directions: '',
    comments: ''
  });

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formState);
    // Add logic to handle form submission like sending data to a server or updating state
  };

  const {t} = useTranslation();

  const { scaleFactor } = useTextSize();
  return (
    <div className="add-restroom-container">
    <form onSubmit={handleSubmit} className="add-restroom-form">
      <h2 style={{ fontSize: `${24 * scaleFactor}px` }}>{t("global.addrestroom.title")}</h2>
      <label style={{ fontSize: `${16 * scaleFactor}px` }}>{t("global.addrestroom.name")}<input type="text" name="name" value={formState.name} onChange={handleChange} required /></label>
      <label style={{ fontSize: `${16 * scaleFactor}px` }}>{t("global.addrestroom.street")}<input type="text" name="street" value={formState.street} onChange={handleChange} required /></label>
      <label style={{ fontSize: `${16 * scaleFactor}px` }}>{t("global.addrestroom.city")}<input type="text" name="city" value={formState.city} onChange={handleChange} required /></label>
      <label style={{ fontSize: `${16 * scaleFactor}px` }}>{t("global.addrestroom.state")}<input type="text" name="state" value={formState.state} onChange={handleChange} required /></label>
      <label style={{ fontSize: `${16 * scaleFactor}px` }}>{t("global.addrestroom.country")}<input type="text" name="country" value={formState.country} onChange={handleChange} required /></label>
      <label style={{ fontSize: `${16 * scaleFactor}px` }}>{t("global.addrestroom.accessible")}<select style={{ fontSize: `${13 * scaleFactor}px` }} name="accessible" value={formState.accessible} onChange={handleChange} required>
      <option value="">{t("global.addrestroom.option")}</option>
          <option style={{ fontSize: `${13 * scaleFactor}px` }} value="Yes">{t("global.addrestroom.yes")}</option>
          <option style={{ fontSize: `${13 * scaleFactor}px` }} value="No">{t("global.addrestroom.no")}</option>
      </select></label>
      <label style={{ fontSize: `${16 * scaleFactor}px` }}>{t("global.addrestroom.unisex")}<select style={{ fontSize: `${13 * scaleFactor}px` }} name="unisex" value={formState.unisex} onChange={handleChange} required>
      <option style={{ fontSize: `${13 * scaleFactor}px` }} value="">{t("global.addrestroom.option")}</option>
          <option style={{ fontSize: `${13 * scaleFactor}px` }} value="Yes">{t("global.addrestroom.yes")}</option>
          <option style={{ fontSize: `${13 * scaleFactor}px` }} value="No">{t("global.addrestroom.no")}</option>
      </select></label>
      <label style={{ fontSize: `${16 * scaleFactor}px` }}>{t("global.addrestroom.changetable")}<select style={{ fontSize: `${13 * scaleFactor}px` }} name="changingTable" value={formState.changingTable} onChange={handleChange} required>
          <option style={{ fontSize: `${13 * scaleFactor}px` }} value="">{t("global.addrestroom.option")}</option>
          <option style={{ fontSize: `${13 * scaleFactor}px` }} value="Yes">{t("global.addrestroom.yes")}</option>
          <option style={{ fontSize: `${13 * scaleFactor}px` }} value="No">{t("global.addrestroom.no")}</option>
      </select></label>
      <label style={{ fontSize: `${16 * scaleFactor}px` }}>
      {t("global.addrestroom.directions")}
      <textarea style={{ fontSize: `${13 * scaleFactor}px` }} name="directions" placeholder={t("global.addrestroom.dirdesc")} onChange={handleChange}></textarea>
      </label>
      <label style={{ fontSize: `${16 * scaleFactor}px` }}>
      {t("global.addrestroom.comment")}
      <textarea style={{ fontSize: `${13 * scaleFactor}px` }} name="comments" placeholder={t("global.addrestroom.commdesc")} onChange={handleChange}></textarea>
      </label>
        <div className="form-actions">
          <button style={{ fontSize: `${13 * scaleFactor}px` }} type="submit" onClick={() => navigate('/dashboard')}>{t("global.addrestroom.submitbtn")}</button>
          <button style={{ fontSize: `${13 * scaleFactor}px` }} type="button" onClick={() => navigate('/')}>{t("global.addrestroom.cancel")}</button>
        </div>
      </form>
    </div>
  );
};

export default AddRestroom;
