const { auth, register, deleteAcc } = require('../accountFuncs.js');
const sqlite3 = require('sqlite3');

beforeEach(() => {
  jest.resetModules();
});

test ('Register system is working', async () => {
  await expect(await register('test', 'test@test', 'testName')).toBe(undefined);
});

test ('Login system is working', async () => {
  await expect(await auth('w@w', 'w')).toEqual({ user: { username: 'w', id: 1 }, message: null });
  await expect(await auth('w@w', 'a')).toEqual({ user: null, message: 'Wrong password!' });
  await expect(await auth('w@re', 'a')).toEqual({ user: null, message: 'No user with that email' });
  await expect(await auth('w@re', 'w')).toEqual({ user: null, message: 'No user with that email' });
});

deleteAcc('test@test');
