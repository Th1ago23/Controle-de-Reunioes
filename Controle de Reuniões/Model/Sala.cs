using System.ComponentModel.DataAnnotations;

namespace Controle_de_Reuniões.Model
{
    public class Sala
    {
        [Key]
        public string Id { get; set; }

        [Required]
        public string Nome { get; set; }

        [Required]
        public int NumeroDeLugares { get; set; }

        [Required]
        public Setores Setor { get; set; }

        [Required]
        public DateTime HorarioDisponivel { get; set; }
    }
}