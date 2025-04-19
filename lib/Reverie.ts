import axios from 'axios'

export const Reverie = async(text: string) => {
    const response = await axios.post('https://revapi.reverieinc.com/', {
        text
    }, {
        headers: {
            'REV-API-KEY': process.env.NEXT_PUBLIC_TEXT_SPEECH_API_KEY,
            'REV-APP-ID': process.env.NEXT_PUBLIC_TEXT_SPEECH_APP,
            'REV-APPNAME': 'tts',
            'speaker': 'hi_female',
            'Content-Type': 'application/json'
        }
    })
    return response.data
}