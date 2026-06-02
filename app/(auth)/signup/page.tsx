/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const [isSeller, setIsSeller] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [owner, setOwner] = useState<string>("");

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phone", phone);
      formData.append("address", address);
      
      if (photo) {
        formData.append("photo", photo);
      }

      formData.append("name", name);
      if (isSeller) {
        formData.append("owner", owner);
      }

      const endpoint = isSeller ? "/seller" : "/customer";
      const url = `${process.env.NEXT_PUBLIC_BASE_API_URL}${endpoint}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "app-key": `${process.env.NEXT_PUBLIC_APP_KEY}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok || responseData.success === false) {
        alert(responseData.message || "Gagal melakukan pendaftaran.");
        return;
      }

      alert("Registrasi Berhasil! Silakan masuk.");
      router.push("/");
    } catch (error) {
      console.error("Error pendaftaran:", error);
      alert("Terjadi masalah jaringan atau server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#020712] flex items-center justify-center p-4 overflow-hidden font-mono text-cyan-100">
      
      {/* LAPISAN 1: GRADASI WARNA PALUNG LAUT (DEEP OCEAN TONE) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#093554_0%,#031628_50%,#01060f_100%)] z-0" />
      
      {/* LAPISAN 2: GRID LABIRIN DIGITAL HUD */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d405_1px,transparent_1px),linear-gradient(to_bottom,#06b6d405_1px,transparent_1px)] bg-size-[32px_32px] z-0" />
      
      {/* LAPISAN 3: PENDARAN CAHAYA MAKHLUK LAUT (BIOLUMINESCENT GLOW) */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-500/5 rounded-full blur-[130px] pointer-events-none animate-pulse [animation-duration:7s]" />

      {/* ELEMEN TAMBAHAN: GELEMBUNG ATMOSFERIK */}
      <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-cyan-400/30 rounded-full blur-xs animate-bounce [animation-duration:6s] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-2.5 h-2.5 bg-cyan-500/20 rounded-full blur-sm animate-bounce [animation-duration:9s] pointer-events-none" />

      {/* SUBNAUTICA HIGH-TECH CONTAINER */}
      <div className="relative z-10 w-full max-w-2xl bg-[#031224]/90 backdrop-blur-xl border-2 border-cyan-500/30 rounded-br-3xl rounded-tl-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] before:content-[''] before:absolute before:top-0 before:left-0 before:w-6 before:h-6 before:border-t-4 before:border-l-4 before:border-orange-500 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-6 after:h-6 after:border-b-4 after:border-r-4 after:border-orange-500">
        
        {/* Top Panel Bar */}
        <div className="flex justify-between items-center border-b border-cyan-950 pb-3 mb-6 text-[10px] text-cyan-500/60 font-bold">
          <span>NightMarket</span>
          <span className="tracking-widest text-orange-400">SignUp</span>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            CREATE ACCOUNT
          </h1>
          <p className="text-cyan-500 text-[10px] mt-1 uppercase tracking-widest font-bold">Create your NightMarket account</p>
        </div>

        {/* ROLE SELECT SWITCH */}
        <div className="mb-8 flex flex-col items-center">
          <span className="text-cyan-400 text-[9px] font-black uppercase tracking-widest mb-3">Select Role</span>
          <div className="flex items-center bg-[#010912] p-1 border border-cyan-950 rounded w-64 justify-between relative select-none">
            <button
              type="button" onClick={() => setIsSeller(false)}
              className={`z-20 text-[10px] font-extrabold tracking-widest w-1/2 py-2 text-center rounded transition-all uppercase ${!isSeller ? "text-white" : "text-cyan-800 hover:text-cyan-400"}`}
            >
              Customer
            </button>
            <button
              type="button" onClick={() => setIsSeller(true)}
              className={`z-20 text-[10px] font-extrabold tracking-widest w-1/2 py-2 text-center rounded transition-all uppercase ${isSeller ? "text-white" : "text-cyan-800 hover:text-cyan-400"}`}
            >
              Seller
            </button>
            <div className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-linear-to-r from-orange-600 to-orange-500 rounded transition-transform duration-300 shadow-[0_0_12px_rgba(249,115,22,0.4)] ${isSeller ? "transform translate-x-full" : ""}`} />
          </div>
        </div>

        {/* Form Pendaftaran */}
        <form className="space-y-5" onSubmit={handleSignUp}>
          
          {/* PHOTO MATRIX INPUT */}
          <div className="flex flex-col items-center space-y-2 p-3 bg-[#010912]/80 border border-cyan-950 rounded-xl">
            <label className="text-cyan-400 text-[9px] font-black uppercase tracking-widest">Profile Photo</label>
            <div className="relative group w-16 h-16 bg-[#020b15] border-2 border-dashed border-cyan-900 rounded flex items-center justify-center overflow-hidden transition-all hover:border-orange-500">
              {photoPreview ? (
                <img src={photoPreview} alt="Matrix Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl text-cyan-900 group-hover:text-orange-400 transition-colors">👤</span>
              )}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <span className="text-[8px] text-cyan-700 uppercase font-bold tracking-wider">Upload Profile Photo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {!isSeller ? (
              <div className="sm:col-span-2">
                <label className="block text-cyan-400 text-[10px] font-bold uppercase mb-1.5">Customer Full Name</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="E.G. RYLEY ROBINSON"
                  className="w-full px-4 py-2.5 bg-[#020b15] border border-cyan-900/60 rounded text-cyan-100 placeholder-cyan-950 text-xs focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all uppercase"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-cyan-400 text-[10px] font-bold uppercase mb-1.5">Store Name</label>
                  <input 
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="E.G. SEAMONTH STORE"
                    className="w-full px-4 py-2.5 bg-[#020b15] border border-cyan-900/60 rounded text-cyan-100 placeholder-cyan-950 text-xs focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all uppercase"
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 text-[10px] font-bold uppercase mb-1.5">Store Owner</label>
                  <input 
                    type="text" required value={owner} onChange={(e) => setOwner(e.target.value)}
                    placeholder="E.G. MARGUERIT MAIDA"
                    className="w-full px-4 py-2.5 bg-[#020b15] border border-cyan-900/60 rounded text-cyan-100 placeholder-cyan-950 text-xs focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all uppercase"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-cyan-400 text-[10px] font-bold uppercase mb-1.5">Username</label>
              <input 
                type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="E.G. DEEP_DIVER"
                className="w-full px-4 py-2.5 bg-[#020b15] border border-cyan-900/60 rounded text-cyan-100 placeholder-cyan-950 text-xs focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all"
              />
            </div>

            <div>
              <label className="block text-cyan-400 text-[10px] font-bold uppercase mb-1.5">Phone Number</label>
              <input 
                type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="E.G. +62 832 991"
                className="w-full px-4 py-2.5 bg-[#020b15] border border-cyan-900/60 rounded text-cyan-100 placeholder-cyan-950 text-xs focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all"
              />
            </div>

            <div>
              <label className="block text-cyan-400 text-[10px] font-bold uppercase mb-1.5">Email</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-4 py-2.5 bg-[#020b15] border border-cyan-900/60 rounded text-cyan-100 placeholder-cyan-950 text-xs focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-cyan-400 text-[10px] font-bold uppercase">Password</label>
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="text-[8px] text-orange-400 hover:text-orange-300 font-black uppercase focus:outline-none"
                >
                  {showPassword ? "[ Hide ]" : "[ View ]"}
                </button>
              </div>
              <input 
                type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[#020b15] border border-cyan-900/60 rounded text-cyan-100 placeholder-cyan-950 text-xs focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all"
              />
            </div>

          </div>

          <div>
            <label className="block text-cyan-400 text-[10px] font-bold uppercase mb-1.5">Address</label>
            <textarea 
              required value={address} onChange={(e) => setAddress(e.target.value)}
              rows={2} placeholder="EX: JL. SEAVIEW NO. 123, OCEAN CITY"
              className="w-full px-4 py-2.5 bg-[#020b15] border border-cyan-900/60 rounded text-cyan-100 placeholder-cyan-950 text-xs focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all resize-none "
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full relative group mt-6 block disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-linear-to-r from-orange-600 to-amber-500 blur-sm opacity-30 group-hover:opacity-80 transition-opacity rounded" />
            <div className="relative w-full py-3.5 bg-linear-to-r from-orange-600 to-orange-500 border border-orange-400/30 rounded text-white font-black text-xs tracking-[0.2em] transition-all transform group-active:scale-[0.99] text-center uppercase">
              {loading ? "CREATING PROFILE..." : "SIGN UP EXECUTION"}
            </div>
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] pt-4 border-t border-cyan-950/60">
          <span className="text-cyan-600">Already have an account?</span>{" "}
          <Link href="/" className="text-orange-400 font-bold hover:text-orange-300 underline underline-offset-4 transition-colors uppercase">
            Login Access
          </Link>
        </div>
      </div>
    </div>
  );
}