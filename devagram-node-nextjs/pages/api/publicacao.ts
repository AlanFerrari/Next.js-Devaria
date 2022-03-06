import type {NextApiResponse} from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import nc from 'next-connect';
import { upload, uploadImageCosmic } from '../../services/uploadImageCosmic';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { PublicacaoModel } from '../../models/PublicacaoModel';
import { UsuarioModel } from '../../models/UsuarioModel';
import { politicaCors } from '../../middlewares/politicaCors';

const handler = nc()
    .use(upload.single('file'))
    .post(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {

        try {
            const {userId} = req.query;
            const usuario = await UsuarioModel.findById(userId);
            if(!usuario){
                return res.status(400).json({erro: 'Usuário não encontrado.'});
            }


            if(!req || !req.body){
                return res.status(400).json({erro: 'Parametros não informados'});

            }
            const {descricao} = req?.body;

            if(!descricao || descricao.length < 2){
                return res.status(400).json({erro: 'Descrição inválida'});
            }
            if (!req.file || !req.file.originalname) {
                return res.status(400).json({erro: 'Imagem é obrigatória'});
            }

            const image = await uploadImageCosmic(req);
            const publicacao = {
                idUsuario: usuario._id,
                descricao,
                foto: image.media.url,
                data: new Date()
            }

            usuario.publicacoes++;
            await UsuarioModel.findByIdAndUpdate({_id: usuario._id}, usuario);

            await PublicacaoModel.create(publicacao);
            return res.status(200).json({msg: 'Publicação feita com sucesso!'});
                
        } catch (e) {
            console.log(e);
            return res.status(400).json({erro: 'Erro ao fazer a publiicação.'});
        }
        
    }); 

    export const config = {
        api: {
            bodyParser: false
        }
    }

    export default politicaCors(validarTokenJWT(conectarMongoDB(handler)));