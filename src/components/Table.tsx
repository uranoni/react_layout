import styles from './Table.module.css';

interface Column {
  title: string;
  key: string;
}

interface TableProps {
  columns: Column[];
  data: Record<string, string>[];
}

const Table = ({ columns, data }: TableProps) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case '正常':
        return styles.normal;
      case '遲到':
        return styles.late;
      case '缺席':
        return styles.absent;
      default:
        return '';
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.key === 'status' ? (
                    <span className={`${styles.status} ${getStatusClass(row[column.key])}`}>
                      {row[column.key]}
                    </span>
                  ) : column.key === 'actions' ? (
                    <button className={styles.actionButton}>{row[column.key]}</button>
                  ) : (
                    row[column.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table; 