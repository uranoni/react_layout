import styles from './Leave.module.css';
import Table from '../../components/Table';

const Leave = () => {
  const columns = [
    { title: '申請編號', key: 'id' },
    { title: '員工姓名', key: 'name' },
    { title: '請假類型', key: 'type' },
    { title: '開始時間', key: 'startDate' },
    { title: '結束時間', key: 'endDate' },
    { title: '狀態', key: 'status' },
    { title: '操作', key: 'actions' }
  ];

  const data = [
    {
      id: 'L001',
      name: '張三',
      type: '事假',
      startDate: '2024-02-20 09:00',
      endDate: '2024-02-20 18:00',
      status: '待審核',
      actions: '審核'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.actionBar}>
        <button className={styles.addButton}>
          <i className="fas fa-plus"></i>
          新增請假
        </button>
      </div>
      <div className={styles.tableWrapper}>
        <Table columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Leave; 