const correctSound = new Audio('/sounds/correct.wav');
const wrongSound = new Audio('/sounds/wrong.wav');

export const playCorrectSound = () => {
    return new Promise((resolve, reject) => {
        try {
            correctSound.currentTime = 0; // Reset to start
            correctSound.volume = 0.5;    // 50% volume
            
            correctSound.onended = () => resolve();
            correctSound.onerror = (error) => {
                console.error('Error loading correct sound:', error);
                reject(error);
            };
            
            const playPromise = correctSound.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.error('Error playing correct sound:', error);
                    reject(error);
                });
            }
        } catch (error) {
            console.error('Error in playCorrectSound:', error);
            reject(error);
        }
    });
};

export const playWrongSound = () => {
    return new Promise((resolve, reject) => {
        try {
            wrongSound.currentTime = 0;  // Reset to start
            wrongSound.volume = 0.5;     // 50% volume
            
            wrongSound.onended = () => resolve();
            wrongSound.onerror = (error) => {
                console.error('Error loading wrong sound:', error);
                reject(error);
            };
            
            const playPromise = wrongSound.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.error('Error playing wrong sound:', error);
                    reject(error);
                });
            }
        } catch (error) {
            console.error('Error in playWrongSound:', error);
            reject(error);
        }
    });
}; 