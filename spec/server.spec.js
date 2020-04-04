const axios = require('axios').default;

describe('simple cal', () => {
    it('should mutiple 2 and 2', () => {
        expect(2 * 2).toBe(4);
    });
});

describe('get messages', () => {
    it('should return 200 OK', (done) => {
        axios.get('http://localhost:3000/messages')
            .then((res) => {
                expect(res.status).toBe(200);
                done();
            });
    });

    it('should return a list that not empty', (done) => {
        axios.get('http://localhost:3000/messages')
            .then((res) => {
                console.log(res.data);
                done();
            });
    });
});