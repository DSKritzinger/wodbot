const axios = require('axios');
const moment = require('moment');

require('dotenv').config()

const crossfitWOD = async () => {
    
    const date = moment();
    const { data } = await axios.get(
        'https://www.crossfit.com/workout/'
    );
    const wodDateId = `w${date.format('YYYYMMDD')}`;

    if (data.wods[0].id === wodDateId) {
        const wod = {};
        wod.id =  data.wods[0].cleanID;
        wod.title = data.wods[0].title; 
        wod.content = data.wods[0].wodRaw;
        return wod;
    } else {
        return {};
    };
};

const contentEditor = async (contentTitle, content) => {
    var message = `**${contentTitle}** \n\n ${content}`

    // var escapeChars = ['_', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    // for (let i=0; i<escapeChars.length; i++ ) {
    //     var message = message.replaceAll(escapeChars[i], `\\${escapeChars[i]}`); 
    // };
    
    return encodeURI(message);
};

const telegramNotifier = async (message) => {

    let urlString = `https://api.telegram.org/bot${process.env.DEVWODBOT_APIKEY}/sendMessage?chat_id=${process.env.DEVWODBOT_GROUPCHATID}&text=${message}`;
    return axios.get(urlString)
            .then(response => response.data)
            .catch(error => {
                console.log(error);
            });
};

const Wodbot = async () => {
    try {
        var wod = await crossfitWOD()
        var message = await contentEditor(wod.title, wod.content)
        var resp = await telegramNotifier(message)

        return resp;
    } catch (error) {
        throw error;
    };
};

Wodbot()
    .then((resp) => console.log(resp));