import bcrypt from 'bcrypt';
import readlineSync from 'readline-sync';

const password = readlineSync.question('Enter the password you want to hash: ', {
  hideEchoBack: true
});

bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Hashed Password:', hashedPassword);
});
