import type {NextApiRequest, NextApiResponse} from 'next';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';
import type {CadastroRequisicao} from '../../types/CadastroRequisicao';
import {UsuarioModel} from '../../models/UsuarioModel';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import md5 from 'md5';
import {upload, uploadImageCosmic} from '../../services/uploadImageCosmic';
import nc from 'next-connect';
import { politicaCors } from '../../middlewares/politicaCors';

const handler = nc()
    .use(upload.single('file'))
    .post(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
           
       try {
            const usuario = req.body as CadastroRequisicao;
            
            if(!usuario.nome || usuario.nome.length < 3){
                return res.status(400).json({erro: `Nome inválido!`});
            }
            
            if (!usuario.email || usuario.email.length < 6 || !usuario.email.includes('@') || !usuario.email.includes('.')) {
                return res.status(400).json({erro: `E-mail inválido!`});            
            }
            
            if (!usuario.senha || usuario.senha.length < 8) {
                return res.status(400).json({erro: `Senha inválida!`});            
            }

            //Validação de email, verificando se já existe um usuário com o mesmo email
            const usuarioComMesmoEmail = await UsuarioModel.find({email: usuario.email});
            if (usuarioComMesmoEmail && usuarioComMesmoEmail.length > 0) {
                return res.status(400).json({erro: 'Já existe uma conta com este email'});
            }

            //Enviar a imagem do multer para o cosmic
            const image = await uploadImageCosmic(req);

            //Salvar os dados no banco de dados
            const usuarioASerSalvo = {
                nome: usuario.nome,
                email: usuario.email,
                senha: md5(usuario.senha),
                avatar: image?.media?.url
            }

            await UsuarioModel.create(usuarioASerSalvo);
            return res.status(200).json({msg: 'Usuário cadastrado com sucesso!'});
       } catch (e: any) {
           console.log(e);
           return res.status(400).json({erro: e.toString()});
       }
         
    });

export const config ={
    api: {
        bodyParser: false  
    }
}


export default politicaCors(conectarMongoDB(handler));