import type { NextApiRequest, NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { SeguidorModel } from "../../models/SeguidorModel";
import { UsuarioModel } from "../../models/UsuarioModel";
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";

const seguirEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
        if (req.method === 'PUT') {

            const {userId, id} = req?.query;

            //usuário autenticado = quem esta navegando na página
            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro: 'Usuário logado não encontrado.'});
            }
            //id do usuário a ser seguidor
            const usuarioASerSeguido = await UsuarioModel.findById(id)
            if(!usuarioASerSeguido){
                return res.status(400).json({erro: 'Usuario a ser seguido não encontrado'});
            }

            //buscar se eu logado sigo ou não esse usuário
            const jaEstouSeguindo = await SeguidorModel.find({usuarioId: usuarioLogado._id, usuarioSeguidoId: usuarioASerSeguido._id});

            if (jaEstouSeguindo && jaEstouSeguindo.length > 0) {
                //sinal que eu já sigo esse usuário
                jaEstouSeguindo.forEach(async(e: any) => await SeguidorModel.findByIdAndDelete({_id: e._id}));
               
                usuarioLogado.seguindo--;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioLogado._id}, usuarioLogado);

                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg: 'Deixou de seguir o usuário com sucesso!'});
            }
            else{
                //sinal que eu não sigo esse usuário
                const seguidor = {
                    usuarioId: usuarioLogado._id,
                    usuarioSeguidoId: usuarioASerSeguido._id
                }
                await SeguidorModel.create(seguidor);

                //adicionar um seguindo no usuário logado
                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioLogado._id}, usuarioLogado);
                
                //adicinar um seguidor ao usuário seguido
                usuarioASerSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioASerSeguido._id}, usuarioASerSeguido);
                
                return res.status(200).json({msg: 'Seguindo usuário com sucesso!'});
            }
        }

        return res.status(405).json({erro: 'Método informado inválido'});

    } catch (e) {
        console.log(e);
        return res.status(500).json({erro: 'Não foi possivel seguir ou deixar de seguir o usuário.'});
    }
}

export default validarTokenJWT(conectarMongoDB(seguirEndpoint));