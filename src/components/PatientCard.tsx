import React from 'react';
import { Patient, PatientStatus } from '../types';

interface PatientCardProps {
  patient: Patient;
  onClick: (id: string) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.PRENATAL:
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case PatientStatus.POSTNATAL:
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case PatientStatus.GYNECO:
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case PatientStatus.URGENT:
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBorderColor = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.PRENATAL:
        return 'border-l-rose-500';
      case PatientStatus.POSTNATAL:
        return 'border-l-emerald-500';
      case PatientStatus.GYNECO:
        return 'border-l-purple-500';
      case PatientStatus.URGENT:
        return 'border-l-red-500';
      default:
        return 'border-l-slate-300';
    }
  };

  return (
    <div
      onClick={() => onClick(patient.id)}
      className={`bg-white rounded-2xl shadow-sm border-l-4 p-5 hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all duration-200 border-rose-50 ${getBorderColor(
        patient.status
      )}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 leading-tight">
            {patient.lastName.toUpperCase()} {patient.firstName}
          </h3>
          <p className="text-xs text-slate-500 font-bold tracking-wide mt-1">{patient.phone}</p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(
            patient.status
          )}`}
        >
          {patient.status}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        {patient.pregnancyInfo && patient.status !== PatientStatus.GYNECO && (
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-bold uppercase text-[10px]">DPA</span>
            <span className="font-extrabold text-slate-800">
              {new Date(patient.pregnancyInfo.dpa).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}
        {patient.status === PatientStatus.GYNECO && patient.lastSmearDate && (
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-bold uppercase text-[10px]">Frottis</span>
            <span className="font-extrabold text-slate-800">
              {new Date(patient.lastSmearDate).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-rose-600 border-t border-rose-50 pt-2 mt-2">
          <span className="font-bold uppercase text-[10px]">Prochain RDV</span>
          <span className="font-black">{new Date(patient.nextAppointment).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;
