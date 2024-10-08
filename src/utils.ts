const hexToBinary = (s: string): string | null => {
    let ret: string = '';
    const lookupTable: { [key: string]: string } = {
        '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
        '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
        'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
        'e': '1110', 'f': '1111'
    };

    for (let i = 0; i < s.length; i++) {
        const char = s[i].toLowerCase(); // Convert to lowercase to handle uppercase hex characters
        if (lookupTable[char]) {
            ret += lookupTable[char];
        } else {
            return null; // Return null if an invalid character is found
        }
    }
    return ret;
};

export { hexToBinary };
