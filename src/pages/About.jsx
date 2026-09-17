import React from "react";
import { NavLink } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import developer from "../assets/developer.jpg";

const About = () => {
  return (
    <div>
      {/* navbar */}
      <div>
        <div className="flex justify-between items-center bg-white border-b border-slate-200 sticky top-0 z-40">
          <NavLink
            to="/"
            className="flex justify-center font-bold py-3 items-center w-25"
          >
            <IoIosArrowBack size={30} />
            Orqaga
          </NavLink>
        </div>
      </div>
      {/* menu text */}
      <div>
        {/* funder */}
        <div className=" flex justify-center items-center flex-col mt-3.5 rounded-2xl bg-white w-[70%] py-3.75 m-auto ">
          <img className=" h-60 rounded-2xl " src={developer} alt="" />
          <h3 className=" font-bold">
            <span className=" font-normal text-[12px] ">Developer:</span> Xusan
            Baxramov
          </h3>
        </div>
        {/* investor */}
        <div></div>
        {/* about us */}
        <div className=" flex justify-center items-center flex-col text-center mt-3.5 px-3.5">
          <h2 className=" mb-1 font-bold ">AvtoTek - loyiha maqsadi</h2>
          <p>
            **AvtoTek — ishonchli va shaffof avto-bozor!** Bizning asosiy
            maqsadimiz — har bir avtomobilni sotuvga qo'yishdan oldin chuqur
            texnik va huquqiy tekshiruvdan o'tkazishdir. Mijozlarimizga sifatli
            avtolarni taqdim etish bilan birga, halol nasiya savdo tizimini ham
            taklif qilamiz. AvtoTek bilan xaridingiz halol, xavfsiz va mutlaqo
            ishonchli bo'ladi!
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
