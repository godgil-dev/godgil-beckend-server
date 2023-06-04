export const VALIDATE_ERROR_MESSAGE = {
  EMAIL: '이메일 형식이 올바르지 않습니다. 올바른 이메일 주소를 입력해주세요.',
  PASSWORD:
    '비밀번호가 올바르지 않습니다. 최소 8자, 최대 20자, 최소 하나의 문자, 숫자, 특수문자를 포함해주세요.',
  NEW_PASSWORD:
    '신규 비밀번호가 올바르지 않습니다. 최소 8자, 최대 20자, 최소 하나의 문자, 숫자, 특수문자를 포함해주세요.',
  PASSWORD_NOT_MATCH: `기존 패스워드와 일치하지 않습니다. 다시 확인해주세요`,
  SAME_AS_THE_OLD_PASSWORD: '기존 패스워드와 동일합니다. 다르게 설정해주세요',
} as const;

export const FILE_ERROR_MESSAGE = {
  FILE_NOT_FOUND: '파일이 존재하지 않습니다.',
};
