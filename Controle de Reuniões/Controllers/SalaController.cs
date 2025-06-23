using Controle_de_Reuniões.Data;
using Controle_de_Reuniões.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Controle_de_Reuniões.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SalaController(AppDbContext context)
        {
            _context = context;
        }

        // DTO para criação/atualização de sala
        public class SalaDto
        {
            public string Id { get; set; } = string.Empty;
            public string Nome { get; set; } = string.Empty;
            public int NumeroDeLugares { get; set; }
            public Setores Setor { get; set; }
            public string? Descricao { get; set; }
            public bool Ativa { get; set; } = true;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sala>>> GetSalas()
        {
            return await _context.Salas
                .Where(s => s.Ativa)
                .OrderBy(s => s.Nome)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Sala>> GetSala(string id)
        {
            var sala = await _context.Salas
                .Include(s => s.Reservas.Where(r => !r.Cancelada))
                .FirstOrDefaultAsync(s => s.Id == id && s.Ativa);

            if (sala == null)
            {
                return NotFound();
            }

            return sala;
        }

        [HttpPost]
        public async Task<ActionResult<Sala>> CreateSala(SalaDto salaDto)
        {
            if (await _context.Salas.AnyAsync(s => s.Id == salaDto.Id))
            {
                return BadRequest("Já existe uma sala com este ID");
            }

            var sala = new Sala
            {
                Id = salaDto.Id,
                Nome = salaDto.Nome,
                NumeroDeLugares = salaDto.NumeroDeLugares,
                Setor = salaDto.Setor,
                Descricao = salaDto.Descricao,
                Ativa = salaDto.Ativa
            };

            _context.Salas.Add(sala);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSala), new { id = sala.Id }, sala);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSala(string id, SalaDto salaDto)
        {
            if (id != salaDto.Id)
            {
                return BadRequest();
            }

            var salaExistente = await _context.Salas.FindAsync(id);
            if (salaExistente == null)
            {
                return NotFound();
            }

            salaExistente.Nome = salaDto.Nome;
            salaExistente.NumeroDeLugares = salaDto.NumeroDeLugares;
            salaExistente.Setor = salaDto.Setor;
            salaExistente.Descricao = salaDto.Descricao;
            salaExistente.Ativa = salaDto.Ativa;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Salas.Any(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSala(string id)
        {
            var sala = await _context.Salas.FindAsync(id);
            if (sala == null)
            {
                return NotFound();
            }

            var reservasAtivas = await _context.Reservas
                .AnyAsync(r => r.SalaId == id && !r.Cancelada);

            if (reservasAtivas)
            {
                return BadRequest("Não é possível excluir uma sala que possui reservas ativas");
            }

            sala.Ativa = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}