import { useState } from "react";
import styles from "./AttendanceLeavePage.module.css";

const AttendanceLeavePage = () => {
  const [formData, setFormData] = useState({
    applicant: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    reason: "",
    comment: "",
    agent: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("請假申請資料:", formData);
    alert("請假申請已提交！");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>請假申請</h2>
      <div className={styles.form}>
        <div className={styles.row}>
          <label>申請人</label>
          <input type="text" name="applicant" value={formData.applicant} onChange={handleChange} />
        </div>

        <div className={styles.row}>
          <label>時段</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
          <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} />
          <span>至</span>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
          <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
        </div>

        <div className={styles.row}>
          <label>事由</label>
          <select name="reason" value={formData.reason} onChange={handleChange}>
            <option value="">請選擇</option>
            <option value="公假">公假</option>
            <option value="事假">事假</option>
            <option value="病假">病假</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div className={styles.row}>
          <label>備註</label>
          <textarea name="comment" value={formData.comment} onChange={handleChange} />
        </div>

        <div className={styles.row}>
          <label>代理人</label>
          <input type="text" name="agent" value={formData.agent} onChange={handleChange} />
        </div>

        <button className={styles.submitButton} onClick={handleSubmit}>提交申請</button>
      </div>
    </div>
  );
};

export default AttendanceLeavePage;
