// application/services/user-auth.ts
// ⚠️🧠🧑‍💻 VAMOS A INTENTAR NO ABUSAR, EXTRAER PARTES COMUNES EN LA PARTE DE ATOMIC
import { ExtendedJWTPayload } from "@/types/auth";
import { LoginPayload, VerifyLoginPayloadParams } from "thirdweb/auth";
import { User} from "@/core/domain/entities/User";
import { RoleType } from "@/core/domain/entities/Role";
import crypto from "crypto"
import { UserRepository } from "../../repositories/user";
import { AuthRepository } from "../../services/auth";
import { RoleRepository } from "../../repositories/role";
import { userRepository } from "@/core/infrastructure/repositories/mongoose-user";
import { roleRepository } from "@/core/infrastructure/repositories/mongoose-role";
import { authRepository } from "@/core/infrastructure/services/thirdweb-auth";
import { createRoleUC } from "../atomic/role";


//No se donde poner esto, luego lo terminare de pensar
class TokenGenerator {
  private generateToken(): string{
    return crypto.randomBytes(20).toString("hex")
  }
  private hashToken(token:string): string{
    return crypto.createHash("sha256").update(token).digest("hex")
  }
  generateVerificationToken(): {hashedToken: string, expireDate: Date}{
    const verificationToken = this.generateToken();
    const hashedToken = this.hashToken(verificationToken);
    const expireDate = new Date(Date.now() + 30 * 60 * 1000); 
    return{
      hashedToken, expireDate
    }
  }
}
export const tokenGenerator = () => {
  const t = new TokenGenerator()
  return t.generateVerificationToken()
}



// user-auth service

abstract class UseUserAuthService {
  constructor(protected userRepository: UserRepository, protected authRepository: AuthRepository) { }
}



class LoginUser extends UseUserAuthService {
  async execute(payload: VerifyLoginPayloadParams): Promise<ExtendedJWTPayload> {
    const verifiedPayload = await this.authRepository.verifyPayload(payload);
    if (!verifiedPayload.valid) throw new Error("Payload not valid")
    let user = await this.userRepository.findByAddress(verifiedPayload.payload.address);
    if (!user) {
      user = await this.userRepository.create({ address: verifiedPayload.payload.address, roleId: null, role: null, solicitud: null, img: null, email: null })
    }

    const jwt = await this.authRepository.setJwt(
      payload,
      {
        role: user.role || undefined,
        nick: user.nick,
        id: user.id
        // Puedes agregar más datos al contexto si es necesario
      }
    );
    return jwt
  }
}
export const loginUserUC = async (payload: VerifyLoginPayloadParams) => {
  const l = new LoginUser(userRepository, authRepository)
  return await l.execute(payload)
}





class UserInCookies extends UseUserAuthService {
  async execute(): Promise<User | false> {
    const cooki = await this.authRepository.getCookies()
    if (!cooki) return false
    const user = await this.userRepository.findByAddress(cooki.sub)
    if (!user) return false
    return user
  }
}
export const userInCookiesUC = async () => {
  const u = new UserInCookies(userRepository,authRepository)
  return await u.execute()
}
// user-role services

abstract class UseUserRoleAuthService {
  constructor(protected userRepository: UserRepository, protected roleRepository: RoleRepository, protected authRepository: AuthRepository) { }
}
class DeleteUserAccount extends UseUserRoleAuthService {

  async execute(payload: {
    signature: `0x${string}`;
    payload: LoginPayload;
  }, id: string, address: string) {
    const v = await this.authRepository.verifyPayload(payload)
    if (!v.valid) throw new Error("Error with payload auth")
    if (v.payload.address !== address) throw new Error("User only can delete her address")

    //deleteUser(id)
    const user = await this.userRepository.findById(id)
    if (!user) throw new Error("User not found")
    if (user.roleId !== null) {
      await this.roleRepository.delete(user.roleId)
    }
    await this.userRepository.delete(id)
    await this.authRepository.logout()
  }

}
export const deleteUserAccountUC = async (payload: {
  signature: `0x${string}`;
  payload: LoginPayload;
}, id: string, address: string) => {
  const d = new DeleteUserAccount(userRepository, roleRepository, authRepository)
  return await d.execute(payload,id,address)
}

// Remember update user isAdmin, and solicitudAdmin in bdd!!!!
class MakeAdmin extends UseUserRoleAuthService {
  async execute(payload: {
    signature: `0x${string}`;
    payload: LoginPayload;
  }, id: string) {
    const v = await this.authRepository.verifyPayload(payload)
    if (!v.valid) throw new Error("Error with payload auth")
      const signUser = await userRepository.findByAddress(payload.payload.address)
  if (!signUser) throw new Error("Error at find signer user")
  if (signUser.role!=="ADMIN") throw new Error("Only admins can do this action")
    const createdRole = await createRoleUC(payload.payload.address,"ADMIN" as RoleType)
    await this.userRepository.update({
      id, address: signUser.address, roleId: createdRole.id,
      role: RoleType["ADMIN"], solicitud: null, img: signUser.img, email: signUser.email, isVerified: signUser.isVerified
    })
  }
}
export const makeAdminUC = async(payload: {
  signature: `0x${string}`;
  payload: LoginPayload;
}, id: string) => {
  const m = new MakeAdmin(userRepository, roleRepository, authRepository)
  return await m.execute(payload,id)
}
