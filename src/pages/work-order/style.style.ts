import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => {
  return {
    container: {
      '.ant-pro-table-list-toolbar': {
        flexWrap: 'wrap',
        gap: '8px',
      },
    },
    statusTag: {
      minWidth: '64px',
      textAlign: 'center' as const,
    },
    priorityTag: {
      minWidth: '48px',
      textAlign: 'center' as const,
    },
    batchBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${token.paddingSM}px ${token.paddingLG}px`,
      backgroundColor: token.colorBgElevated,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: `${token.borderRadiusLG}px ${token.borderRadiusLG}px 0 0`,
    },
    batchInfo: {
      color: token.colorTextSecondary,
      fontSize: token.fontSize,
      '& strong': {
        color: token.colorPrimary,
        fontWeight: token.fontWeightStrong,
      },
    },
    batchActions: {
      display: 'flex',
      gap: token.marginXS,
    },
    searchFormItem: {
      marginBottom: token.marginSM,
    },
    extraContent: {
      display: 'flex',
      flexDirection: 'row' as const,
      gap: '12px',
    },
  };
});

export default useStyles;
