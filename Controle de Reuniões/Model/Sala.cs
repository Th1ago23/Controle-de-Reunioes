using System.ComponentModel.DataAnnotations;

namespace Controle_de_Reuniões.Model
{
    public class Sala
    {

        private string _id { get; set; }
        private string _nome { get; set; }
        private int  _numeroDeLugares { get; set; }
        private string _setor { get; set; }

        [DataType(DataType.Date)]
        private DateTime _horariosDisponiveis;

        public Sala(string id, string nome, int numeroDeLugares, string setor, DateTime horariosDisponiveis)
        {

            _id = id;
            _nome = nome;
            _numeroDeLugares = numeroDeLugares;
            _setor = setor;

            _horariosDisponiveis = horariosDisponiveis;
        }

    }
}
