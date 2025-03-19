import styles from './Table.module.css';

interface Column {
  title: string;
  key: string;
  render?: (record: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: Record<string, any>[];
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
                  {column.render ? column.render(row) : row[column.key]}
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