import { GenerateLoginPayloadParams, LoginPayload, VerifyLoginPayloadParams } from "thirdweb/auth";
import { AuthRepository } from "../../services/auth";
import { ExtendedJWTPayload, JWTContext } from "@/types/auth";
import { authRepository } from "@/core/infrastructure/repositories/thirdweb-auth-repository";

abstract class UseAuth {
    constructor(protected authRepository: AuthRepository){}
}
export class Logout extends UseAuth {
    async execute(): Promise<void> {
        this.authRepository.logout()
    }
}
// export class GetCookies extends UseAuth {
//     async execute(): Promise<ExtendedJWTPayload|false>{
//         return this.authRepository.getCookies()
//     }
// }
export class IsLoggedIn extends UseAuth {
    async execute(): Promise<boolean>{
        return this.authRepository.isLoggedIn()
    }
}
// export class IsAdmin extends UseAuth {
//     async execute(): Promise<boolean>{
//         return this.authRepository.isAdmin()
//     }
// }
// export class ProtAdmAct extends UseAuth {
//     async execute(): Promise<true>{
//         return this.authRepository.protAdmAct()
//     }
// }
// export class ProtLogAct extends UseAuth {
//     async execute(): Promise<ExtendedJWTPayload> {
//         return this.authRepository.protLogAct()
//     }
// }
// export class ProtLogRou extends UseAuth {
//     async execute(path:string): Promise<ExtendedJWTPayload>{
//         return this.authRepository.protLogRou(path)
//     }
// }
// export class ProtAdmRou extends UseAuth {
//     async execute(path:string): Promise<ExtendedJWTPayload>{
//         return this.authRepository.protAdmRou(path)
//     }
// }
export class GeneratePayload extends UseAuth {
    async execute(address:GenerateLoginPayloadParams): Promise<LoginPayload> {
        return this.authRepository.generatePayload(address)
    }
}
// export class VerifyPayload extends UseAuth {
//     async execute(params: VerifyLoginPayloadParams): Promise<VerifyLoginPayloadResult>{
//         return this.authRepository.verifyPayload(params)
//     }
// }
class SetJwt extends UseAuth {
    async execute(payload: VerifyLoginPayloadParams, context:JWTContext): Promise<ExtendedJWTPayload>{
        return await this.authRepository.setJwt(payload, context)
    }
}
export const setJwtUC = async (payload: VerifyLoginPayloadParams, context:JWTContext)=> {
    const s = new SetJwt(authRepository)
    return await s.execute(payload,context)
}