import multer from 'multer';
import cosmicjs from 'cosmicjs';

const{
    CHAVE_GRAVACAO_AVATARES,
    CHAVE_GRAVACAO_PUBLICACOES,
    BUCKET_AVATARES,
    BUCKET_PUBLICACOES} = process.env;

const Cosmic = cosmicjs();
const bucketAvatares = Cosmic.bucket({
    slug: BUCKET_AVATARES,
    write_key: CHAVE_GRAVACAO_AVATARES
});

const bucketPuclicacoes = Cosmic.bucket({
    slug: BUCKET_PUBLICACOES,
    write_key: CHAVE_GRAVACAO_PUBLICACOES
});

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const uploadImageCosmic = async (req: any) => {
    if(req?.file?.originalname){

        if(!req.file.originalname.includes('.png') && !req.file.originalname.includes('.jpg') && !req.file.originalname.includes('.jpeg')){
            
            throw new Error('Extensão da imagem inválida!');
        }

        const media_object = {
            originalname: req.file.originalname,
            buffer: req.file.buffer
        };

        if(req.url && req.url.includes('publicacao')){
            return await bucketPuclicacoes.addMedia({media: media_object});
        }
        else{
            return await bucketAvatares.addMedia({media: media_object});
        }
    }
}

export {upload, uploadImageCosmic};