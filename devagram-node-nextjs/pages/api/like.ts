import type { NextApiRequest, NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import {PublicacaoModel} from '../../models/PublicacaoModel'
import { UsuarioModel } from "../../models/UsuarioModel";
import { politicaCors } from "../../middlewares/politicaCors";

const likeEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    
    try {

        if (req.method === 'PUT') {
            //id da publicação
            const {id} = req?.query;
            const publicacao = await PublicacaoModel.findById(id);
            if(!publicacao){
                return res.status(400).json({erro: 'Publicação não encontrada.'});
            }
            //id do usuário que está curtindo a publicação
            const {userId} = req?.query;
            const usuario = await UsuarioModel.findById(userId);
            if(!usuario){
                return res.status(400).json({erro: 'Usuário não encontrado.'});
            }

            const indexDoUsuarioNoLike = publicacao.likes.findIndex((e: any) => e.toString() === usuario._id.toString());

            //se o index for > -1 sinal de que o usuário ja curte a foto
            if (indexDoUsuarioNoLike != -1) {
                publicacao.likes.splice(indexDoUsuarioNoLike, 1);
                await PublicacaoModel.findByIdAndUpdate({_id: publicacao._id}, publicacao);
                return res.status(200).json({msg: 'Publicação descurtida com sucesso!'});
            }
            //se o indez for igual a -1 sinal de que o usuário não curte a foto
            else{
                publicacao.likes.push(usuario._id);
                await PublicacaoModel.findByIdAndUpdate({_id: publicacao._id}, publicacao);
                return res.status(200).json({msg: 'Publicação curtida com sucesso!'});
            }
        }
        return res.status(405).json({erro: 'Método informado inválido.'});
        
    } catch (e) {
        console.log(e);
        return res.status(500).json({erro: 'Ocorreu erro ao curtir / descutir uma publicação.'});
    }
}

export default politicaCors(validarTokenJWT(conectarMongoDB(likeEndpoint)));