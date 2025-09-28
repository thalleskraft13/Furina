const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

class RestMessenger {
  /**
   * @param {string} token - Token do bot (use client.token ou process.env.TOKEN)
   */
  constructor(token) {
    this.rest = new REST({ version: '10' }).setToken(token);
  }

  /**
   * Envia uma mensagem para um canal via REST, ignorando cache.
   * @param {string} canalId - ID do canal de destino
   * @param {string|object} conteudo - Conteúdo da mensagem ou objeto completo (com embed, etc)
   * @returns {Promise<void>}
   */
  async enviar(canalId, conteudo) {
    try {
      const body = typeof conteudo === 'string' ? { content: conteudo } : conteudo;

      await this.rest.post(
        Routes.channelMessages(canalId),
        { body }
      );

    } catch (error) {
      console.error(`[REST] Erro ao enviar mensagem no canal ${canalId}:`, error?.message || error);
    }
  }

  /**
   * Busca os dados públicos de um usuário via REST
   * @param {string} userId - ID do usuário
   * @returns {Promise<{ username: string, avatar: string }|null>}
   */
  async buscarUsuario(userId) {
    try {
      const user = await this.rest.get(Routes.user(userId));
      return user;
    } catch (error) {
      console.error(`[REST] Erro ao buscar usuário ${userId}:`, error?.message || error);
      return null;
    }
  }
}

module.exports = RestMessenger;
